from statistics import mean, pstdev

def detect(records: list[dict], threshold: float = 2.0) -> list[dict]:
    """Z-score outlier detection per AWS service; requires four observations."""
    grouped: dict[str, list[dict]] = {}
    for item in sorted(records, key=lambda x: x["date"]):
        grouped.setdefault(item["service"], []).append(item)
    anomalies = []
    for service, items in grouped.items():
        values = [float(x["amount"]) for x in items]
        for index in range(3, len(items)):
            baseline = values[:index]
            avg, deviation = mean(baseline), pstdev(baseline)
            z_score = (values[index] - avg) / deviation if deviation else (999 if values[index] > avg else 0)
            if z_score >= threshold:
                severity = "critical" if z_score >= 4 else "high" if z_score >= 3 else "medium"
                anomalies.append({"date": items[index]["date"], "service": service, "amount": items[index]["amount"], "baseline": round(avg, 4), "zScore": round(z_score, 2), "severity": severity})
    return anomalies

