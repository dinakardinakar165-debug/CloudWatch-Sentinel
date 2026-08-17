from backend.collector import scheduled_collector
from backend.shared import repository

def test_scheduled_collector_runs_and_stores():
    user_id = "test-collector-user"
    result = scheduled_collector(user_id=user_id)
    assert result["status"] == "success"
    assert result["recordsProcessed"] > 0
    assert result["anomaliesDetected"] >= 0

    costs = repository.list_costs(user_id)
    assert len(costs) > 0

    notifications = repository.list_notifications(user_id)
    assert isinstance(notifications, list)
