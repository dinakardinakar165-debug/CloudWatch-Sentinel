import os
import uuid
from datetime import datetime, timezone
from backend.anomaly.detector import detect
from backend.cost.service import collect_costs
from backend.notification.service import publish_anomaly
from backend.shared import repository
from backend.shared.http import log

def scheduled_collector(event=None, context=None, user_id: str = "demo-user"):
    """Executes cost data generation, anomaly detection, and notification saving."""
    account = repository.get_account(user_id) or {
        "userId": user_id,
        "accountName": "Demo Cloud Account",
        "roleArn": "arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly",
        "externalId": "sentinel-demo-ext-12345"
    }

    # Generate 30 days of daily cost records
    records = collect_costs(days=30)
    
    # Save cost records in SQLite database
    for record in records:
        repository.save_cost(
            user_id=user_id,
            date=record["date"],
            service=record["service"],
            amount=record["amount"],
            currency=record.get("currency", "USD")
        )

    # Detect cost anomalies using Z-score math
    detected_anomalies = detect(records)
    saved_anomalies = []

    for anomaly in detected_anomalies:
        anomaly_dict = {
            "userId": user_id,
            "anomalyId": f"{anomaly['date']}#{anomaly['service']}#{uuid.uuid4()}",
            "date": anomaly["date"],
            "service": anomaly["service"],
            "amount": anomaly["amount"],
            "baseline": anomaly["baseline"],
            "zScore": anomaly["zScore"],
            "severity": anomaly["severity"],
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        saved = repository.save_anomaly(user_id, anomaly_dict)
        saved_anomalies.append(saved)

        # Publish notification for high/critical anomalies
        if anomaly["severity"] in ("medium", "high", "critical"):
            publish_anomaly(anomaly_dict, account["accountName"])

    log("collection_complete", user_id=user_id, records=len(records), anomalies=len(saved_anomalies))
    return {
        "status": "success",
        "recordsProcessed": len(records),
        "anomaliesDetected": len(saved_anomalies),
        "anomalies": saved_anomalies
    }
