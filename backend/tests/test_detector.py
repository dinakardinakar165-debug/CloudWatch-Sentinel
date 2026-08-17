from backend.anomaly.detector import detect

def test_detects_spike():
    rows = [{"date": f"2026-01-0{i}", "service": "Amazon S3", "amount": amount} for i, amount in enumerate([1, 1.1, .9, 12], 1)]
    result = detect(rows)
    assert len(result) == 1
    assert result[0]["severity"] in {"high", "critical"}

def test_ignores_short_history():
    assert detect([{"date": "2026-01-01", "service": "EC2", "amount": 5}]) == []
