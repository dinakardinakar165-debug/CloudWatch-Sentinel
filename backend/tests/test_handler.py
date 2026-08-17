import json
from unittest.mock import MagicMock, patch
import pytest
from backend.handler import api_handler

@pytest.fixture
def cognito_claims():
    return {
        "requestContext": {
            "http": {"method": "GET"},
            "authorizer": {
                "jwt": {
                    "claims": {
                        "sub": "user-12345",
                        "email": "test@example.com"
                    }
                }
            }
        }
    }

def test_handler_health():
    event = {"rawPath": "/health", "requestContext": {"http": {"method": "GET"}}}
    res = api_handler(event, None)
    assert res["statusCode"] == 200
    assert json.loads(res["body"])["status"] == "healthy"

def test_handler_404():
    event = {"rawPath": "/unknown", "requestContext": {"http": {"method": "GET"}}}
    res = api_handler(event, None)
    assert res["statusCode"] == 404

def test_handler_register_invalid():
    event = {"rawPath": "/register", "requestContext": {"http": {"method": "POST"}}, "body": "{}"}
    res = api_handler(event, None)
    assert res["statusCode"] == 400

@patch("backend.handler.register")
def test_handler_register_success(mock_register):
    mock_register.return_value = {"UserSub": "sub-123"}
    event = {
        "rawPath": "/register",
        "requestContext": {"http": {"method": "POST"}},
        "body": json.dumps({"email": "test@example.com", "password": "Password123!"})
    }
    res = api_handler(event, None)
    assert res["statusCode"] == 201
    body = json.loads(res["body"])
    assert body["userSub"] == "sub-123"

@patch("backend.handler.login")
def test_handler_login_success(mock_login):
    mock_login.return_value = {"IdToken": "id-token-xyz"}
    event = {
        "rawPath": "/login",
        "requestContext": {"http": {"method": "POST"}},
        "body": json.dumps({"email": "test@example.com", "password": "Password123!"})
    }
    res = api_handler(event, None)
    assert res["statusCode"] == 200
    assert json.loads(res["body"])["IdToken"] == "id-token-xyz"

@patch("backend.handler.confirm_registration")
def test_handler_confirm_registration_success(mock_confirm):
    event = {
        "rawPath": "/confirm-registration",
        "requestContext": {"http": {"method": "POST"}},
        "body": json.dumps({"email": "test@example.com", "code": "123456"})
    }
    res = api_handler(event, None)
    assert res["statusCode"] == 204

@patch("backend.shared.repository.list_costs")
def test_handler_cost_history(mock_list_costs, cognito_claims):
    mock_list_costs.return_value = [{"date": "2026-08-01", "service": "Compute Services", "amount": 45.5}]
    cognito_claims["rawPath"] = "/cost-history"
    res = api_handler(cognito_claims, None)
    assert res["statusCode"] == 200
    assert len(json.loads(res["body"])) == 1

@patch("backend.shared.repository.list_anomalies")
def test_handler_anomalies(mock_anomalies, cognito_claims):
    mock_anomalies.return_value = [{"anomalyId": "1", "severity": "high"}]
    cognito_claims["rawPath"] = "/anomalies"
    res = api_handler(cognito_claims, None)
    assert res["statusCode"] == 200
    assert len(json.loads(res["body"])) == 1

@patch("backend.shared.repository.get_account")
@patch("backend.shared.repository.list_anomalies")
@patch("backend.shared.repository.list_costs")
def test_handler_dashboard(mock_costs, mock_anomalies, mock_get_account, cognito_claims):
    mock_costs.return_value = [{"date": "2026-08-01", "amount": 15.0}]
    mock_anomalies.return_value = []
    mock_get_account.return_value = {"accountName": "Demo Cloud Account"}
    cognito_claims["rawPath"] = "/dashboard"
    res = api_handler(cognito_claims, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body["latestDailyCost"] == 15.0
    assert body["account"]["accountName"] == "Demo Cloud Account"

@patch("backend.handler.scheduled_collector")
def test_handler_demo_cost_generate(mock_collector, cognito_claims):
    mock_collector.return_value = {"status": "success"}
    cognito_claims["rawPath"] = "/demo/generate-cost"
    cognito_claims["requestContext"]["http"]["method"] = "POST"
    res = api_handler(cognito_claims, None)
    assert res["statusCode"] == 202
