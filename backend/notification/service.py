import json
import logging
from backend.shared import repository

logger = logging.getLogger("sentinel.notification")
logger.setLevel(logging.INFO)

def publish_anomaly(anomaly: dict, account_name: str = "Demo Cloud Account") -> dict:
    user_id = anomaly.get("userId", "demo-user")
    severity = anomaly.get("severity", "high").upper()
    service = anomaly.get("service", "Cloud Service")
    amount = anomaly.get("amount", 0.0)
    baseline = anomaly.get("baseline", 0.0)
    
    title = f"{severity} COST ANOMALY DETECTED"
    message = (
        f"Spike detected in {service} for account '{account_name}'. "
        f"Current spend: ${amount:.2f} (Baseline: ${baseline:.2f}, Z-Score: {anomaly.get('zScore', 0):.2f})."
    )

    # 1. Log notification in backend
    logger.warning(f"[NOTIFICATION] {title} - {message}")

    # 2. Save notification in database
    notification = repository.save_notification(
        user_id=user_id,
        title=title,
        message=message,
        severity=anomaly.get("severity", "high")
    )

    return notification
