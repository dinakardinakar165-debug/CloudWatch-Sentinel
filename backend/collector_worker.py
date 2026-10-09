import time
import threading
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from backend.shared import repository
from backend.aws.client import AWSCloudClient
from backend.database.supabase_client import supabase

logger = logging.getLogger(__name__)

_collection_lock = threading.Lock()
_worker_thread: Optional[threading.Thread] = None
_running = False

def run_collection_cycle(user_id: str = "demo-user-sub") -> Dict[str, Any]:
    """
    Executes a single cost & metric collection cycle with thread safety and database logging.
    """
    if not _collection_lock.acquire(blocking=False):
        logger.info("Collection cycle already in progress; skipping.")
        return {"status": "skipped", "reason": "lock_acquired"}

    start_time = datetime.now(timezone.utc)
    run_id = f"run-{int(start_time.timestamp())}"

    try:
        logger.info(f"Starting cloud collection cycle for user {user_id}")
        account = repository.get_account(user_id) or {
            "userId": user_id,
            "accountName": "Demo Cloud Account",
            "roleArn": "arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly",
            "externalId": "sentinel-demo-ext-12345"
        }

        # Initialize AWS boto3 client
        aws_client = AWSCloudClient(
            role_arn=account.get("roleArn"),
            external_id=account.get("externalId")
        )

        # Trigger collector flow
        from backend.collector import scheduled_collector
        res = scheduled_collector(user_id=user_id)

        # Retrieve & log CloudWatch metrics
        cw_metrics = aws_client.get_cloudwatch_metrics(hours=6)
        for m in cw_metrics[:10]:
            supabase.insert("metric_samples", {
                "user_id": user_id,
                "resource_id": m.get("resourceId", "i-0123456789abcdef0"),
                "metric_name": m.get("metricName", "CPUUtilization"),
                "value": float(m.get("average", 0)),
                "unit": m.get("unit", "Percent"),
                "source": m.get("source", "demo"),
                "timestamp": m.get("timestamp")
            })

        completed_time = datetime.now(timezone.utc)
        run_record = {
            "user_id": user_id,
            "status": "success",
            "records_processed": res.get("recordsProcessed", 0),
            "anomalies_detected": res.get("anomaliesDetected", 0),
            "started_at": start_time.isoformat(),
            "completed_at": completed_time.isoformat()
        }

        supabase.insert("collection_runs", run_record)
        logger.info(f"Collection cycle {run_id} finished successfully.")
        return {
            "status": "success",
            "runId": run_id,
            "recordsProcessed": res.get("recordsProcessed", 0),
            "anomaliesDetected": res.get("anomaliesDetected", 0),
            "completedAt": completed_time.isoformat()
        }

    except Exception as e:
        logger.error(f"Collection cycle {run_id} failed: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}
    finally:
        _collection_lock.release()

def _worker_loop(interval_seconds: int = 300, user_id: str = "demo-user-sub"):
    global _running
    logger.info(f"Collection background worker started (interval: {interval_seconds}s)")
    while _running:
        try:
            run_collection_cycle(user_id=user_id)
        except Exception as e:
            logger.error(f"Error in collection worker loop: {e}")
        time.sleep(interval_seconds)

def start_worker(interval_seconds: int = 300, user_id: str = "demo-user-sub"):
    global _worker_thread, _running
    if _worker_thread and _worker_thread.is_alive():
        return
    _running = True
    _worker_thread = threading.Thread(
        target=_worker_loop,
        args=(interval_seconds, user_id),
        daemon=True
    )
    _worker_thread.start()
    logger.info("Background collector thread initialized.")

def stop_worker():
    global _running
    _running = False
