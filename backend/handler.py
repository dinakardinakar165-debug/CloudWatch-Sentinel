import json
from datetime import datetime, timezone
from backend.authentication.service import confirm_registration, login, register
from backend.collector import scheduled_collector
from backend.shared import config, repository
from backend.shared.http import log, response
from backend.utils.validation import AccountConnection, Confirmation, Credentials, RequestValidationError

def _body(event):
    body = event.get("body")
    if not body:
        return {}
    if isinstance(body, dict):
        return body
    return json.loads(body)

def _user(event):
    req_context = event.get("requestContext", {})
    authorizer = req_context.get("authorizer", {})
    jwt_claims = authorizer.get("jwt", {}).get("claims", {})
    sub = jwt_claims.get("sub") or jwt_claims.get("username")
    if not sub and "claims" in authorizer:
        sub = authorizer["claims"].get("sub") or authorizer["claims"].get("username")
    return sub or "demo-user-sub"

def api_handler(event, context):
    path = event.get("rawPath", "")
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    try:
        if path == "/health" and method == "GET":
            return response(200, {"status": "healthy"})

        if path == "/register" and method == "POST":
            data = Credentials(**_body(event))
            result = register(data.email, data.password)
            return response(201, {"userSub": result["UserSub"], "confirmationRequired": False})

        if path == "/login" and method == "POST":
            data = Credentials(**_body(event))
            return response(200, login(data.email, data.password))

        if path == "/confirm-registration" and method == "POST":
            data = Confirmation(**_body(event))
            confirm_registration(data.email, data.code)
            return response(204, {})

        if path in ("/connect-account", "/cost-history", "/anomalies", "/dashboard", "/summary", "/alerts", "/demo/generate-cost"):
            user_id = _user(event)

            if path == "/connect-account" and method == "POST":
                data = AccountConnection(**_body(event)).model_dump()
                acc = repository.save_account(user_id, data["accountName"], data["roleArn"], data["externalId"])
                return response(201, {"message": "Demo Cloud Account connected", "account": acc})

            if path == "/cost-history" and method == "GET":
                costs = repository.list_costs(user_id)
                if not costs:
                    scheduled_collector(user_id=user_id)
                    costs = repository.list_costs(user_id)
                return response(200, costs)

            if path == "/anomalies" and method == "GET":
                anomalies = repository.list_anomalies(user_id)
                if not anomalies:
                    scheduled_collector(user_id=user_id)
                    anomalies = repository.list_anomalies(user_id)
                return response(200, anomalies)

            if path in ("/dashboard", "/summary") and method == "GET":
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
                return response(200, {
                    "account": account,
                    "latestDailyCost": round(total, 2),
                    "anomalyCount": len(anomalies),
                    "recentAnomalies": anomalies[:5],
                    "costHistory": costs[:30]
                })

            if path in ("/alerts", "/demo/generate-cost") and method == "POST":
                result = scheduled_collector(user_id=user_id)
                return response(202, {"message": "Demo cloud cost update generated successfully", "details": result})

        return response(404, {"message": "Not found"})

    except RequestValidationError as error:
        return response(400, {"message": "Invalid request", "details": str(error)})
    except (TypeError, json.JSONDecodeError) as error:
        return response(400, {"message": "Invalid JSON body", "details": str(error)})
    except Exception as error:
        log("api_error", path=path, error=str(error))
        return response(500, {"message": "Internal server error", "details": str(error)})
