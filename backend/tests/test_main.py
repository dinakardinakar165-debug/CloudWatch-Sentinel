from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_register_and_login():
    reg_payload = {"email": "pytest-user@example.com", "password": "TestPassword123!"}
    reg_res = client.post("/register", json=reg_payload)
    assert reg_res.status_code == 201

    login_res = client.post("/login", json=reg_payload)
    assert login_res.status_code == 200
    data = login_res.json()
    assert "IdToken" in data

def test_dashboard_and_cost_history():
    token_res = client.post("/login", json={"email": "pytest-user@example.com", "password": "TestPassword123!"})
    token = token_res.json().get("IdToken")
    headers = {"Authorization": f"Bearer {token}"}

    dash_res = client.get("/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "latestDailyCost" in dash_data

    cost_res = client.get("/cost-history", headers=headers)
    assert cost_res.status_code == 200
    assert isinstance(cost_res.json(), list)

def test_generate_demo_cost_update():
    token_res = client.post("/login", json={"email": "pytest-user@example.com", "password": "TestPassword123!"})
    token = token_res.json().get("IdToken")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/demo/generate-cost", headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "Demo cloud cost update generated successfully"

def test_anomaly_preview():
    payload = [
        {"date": "2026-08-01", "service": "Compute Services", "amount": 50.0},
        {"date": "2026-08-02", "service": "Compute Services", "amount": 52.0},
        {"date": "2026-08-03", "service": "Compute Services", "amount": 48.0},
        {"date": "2026-08-04", "service": "Compute Services", "amount": 185.0}
    ]
    res = client.post("/anomaly-preview", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["service"] == "Compute Services"
    assert data[0]["severity"] in ("high", "critical")
