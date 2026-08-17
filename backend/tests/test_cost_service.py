from backend.cost.service import collect_costs, generate_demo_costs

def test_generate_demo_costs():
    costs = generate_demo_costs(days=30, generate_spike=True)
    assert len(costs) >= 30 * 6
    services = set(c["service"] for c in costs)
    assert "Compute Services" in services
    assert "Storage Services" in services

def test_collect_costs_returns_metrics():
    costs = collect_costs(days=30)
    assert len(costs) > 0
    spike_item = next((c for c in costs if c["service"] == "Compute Services" and c["amount"] == 185.40), None)
    assert spike_item is not None
