import json
import logging
from decimal import Decimal
from typing import Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class Encoder(json.JSONEncoder):
    def default(self, obj: Any):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def response(status: int, body: Any) -> dict:
    return {"statusCode": status, "headers": {"content-type": "application/json"}, "body": json.dumps(body, cls=Encoder)}

def log(event: str, **fields: Any) -> None:
    logger.info(json.dumps({"event": event, **fields}, cls=Encoder))
