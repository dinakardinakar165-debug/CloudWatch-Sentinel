import os
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Header, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from backend.anomaly.detector import detect
from backend.authentication.service import register, login, confirm_registration, decode_jwt_token
from backend.collector import scheduled_collector
from backend.collector_worker import start_worker, run_collection_cycle
from backend.shared import config, repository
from backend.aws.client import AWSCloudClient
from backend.database.supabase_client import supabase

@asynccontextmanager
async def lifespan(app: FastAPI):
    repository.init_db()
    costs = repository.list_costs("demo-user-sub")
    if not costs:
        scheduled_collector(user_id="demo-user-sub")
    # Start periodic background collection worker
    start_worker(interval_seconds=300, user_id="demo-user-sub")
    yield

app = FastAPI(
    title="CloudWatch Sentinel API",
    description="Real-Time Cloud Cost Monitoring & Anomaly Detection Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
raw_frontend_url = config.FRONTEND_URL
allowed_origins = [url.strip() for url in raw_frontend_url.split(",") if url.strip()]
if "http://localhost:5173" not in allowed_origins:
    allowed_origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in allowed_origins:
    allowed_origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if config.FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class Credentials(BaseModel):
    email: str
    password: str

class Confirmation(BaseModel):
    email: str
    code: str

class AccountConnection(BaseModel):
    accountName: str
    roleArn: str
    externalId: str
    awsRegion: Optional[str] = "us-east-1"

# Helper to extract current user from JWT Authorization header
def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        return "demo-user-sub"
    try:
        token = authorization.replace("Bearer ", "").strip()
        claims = decode_jwt_token(token)
        return claims.get("sub", "demo-user-sub")
    except Exception:
        return "demo-user-sub"

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/system/status")
def system_status():
    return {
        "status": "healthy",
        "supabase": "connected" if supabase.is_connected() else "local_sqlite",
        "version": "2.0.0"
    }

@app.get("/aws/status")
def aws_status(user_id: str = Depends(get_current_user_id)):
    acc = repository.get_account(user_id)
    role_arn = acc.get("roleArn") if acc else None
    ext_id = acc.get("externalId") if acc else None
    client = AWSCloudClient(role_arn=role_arn, external_id=ext_id)
    return client.validate_connection()

@app.get("/supabase/status")
def supabase_status():
    return {
        "enabled": supabase.enabled,
        "connected": supabase.is_connected(),
        "mode": "realtime_postgres" if supabase.is_connected() else "sqlite_fallback"
    }

@app.post("/collector/trigger")
def trigger_collection(user_id: str = Depends(get_current_user_id)):
    res = run_collection_cycle(user_id=user_id)
    return res

@app.post("/register", status_code=201)
def api_register(data: Credentials):
    try:
        res = register(data.email, data.password)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def api_login(data: Credentials):
    try:
        return login(data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/confirm-registration", status_code=204)
def api_confirm(data: Confirmation):
    confirm_registration(data.email, data.code)
    return None

@app.post("/connect-account", status_code=201)
def api_connect_account(data: AccountConnection, user_id: str = Depends(get_current_user_id)):
    acc = repository.save_account(user_id, data.accountName, data.roleArn, data.externalId)
    return {"message": "Cloud Account configured successfully", "account": acc}

@app.get("/cost-history")
def api_cost_history(user_id: str = Depends(get_current_user_id)):
    costs = repository.list_costs(user_id)
    if not costs:
        scheduled_collector(user_id=user_id)
        costs = repository.list_costs(user_id)
    return costs

@app.get("/anomalies")
def api_anomalies(user_id: str = Depends(get_current_user_id)):
    anomalies = repository.list_anomalies(user_id)
    if not anomalies:
        scheduled_collector(user_id=user_id)
        anomalies = repository.list_anomalies(user_id)
    return anomalies

@app.get("/dashboard")
@app.get("/summary")
def api_dashboard(user_id: str = Depends(get_current_user_id)):
    costs = repository.list_costs(user_id)
    if not costs:
        scheduled_collector(user_id=user_id)
        costs = repository.list_costs(user_id)
    
    anomalies = repository.list_anomalies(user_id)
    account = repository.get_account(user_id) or {
        "userId": user_id,
        "accountName": "Demo Cloud Account",
        "roleArn": "arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly",
        "externalId": "sentinel-demo-ext-12345"
    }
    
    latest_date = costs[0].get("date") if costs else ""
    total = sum(float(x["amount"]) for x in costs if x.get("date") == latest_date)

    return {
        "account": account,
        "latestDailyCost": round(total, 2),
        "anomalyCount": len(anomalies),
        "recentAnomalies": anomalies[:5],
        "costHistory": costs[:30],
        "supabaseActive": supabase.is_connected()
    }

@app.get("/alerts")
@app.get("/notifications")
def api_list_alerts(user_id: str = Depends(get_current_user_id)):
    return repository.list_notifications(user_id)

@app.post("/alerts")
@app.post("/demo/generate-cost")
def api_generate_cost(user_id: str = Depends(get_current_user_id)):
    result = scheduled_collector(user_id=user_id)
    return {
        "message": "Demo cloud cost update generated successfully",
        "details": result
    }

@app.post("/anomaly-preview")
def anomaly_preview(records: List[Dict[str, Any]]):
    return detect(records)
