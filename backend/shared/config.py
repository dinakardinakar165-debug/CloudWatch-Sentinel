import os
import secrets

REGION = os.environ.get("AWS_REGION", "ap-south-1")
USERS_TABLE = os.environ.get("USERS_TABLE", "CloudWatchSentinelUsers")
ACCOUNTS_TABLE = os.environ.get("ACCOUNTS_TABLE", "CloudWatchSentinelAccounts")
COST_HISTORY_TABLE = os.environ.get("COST_HISTORY_TABLE", "CloudWatchSentinelCostHistory")
ANOMALIES_TABLE = os.environ.get("ANOMALIES_TABLE", "CloudWatchSentinelAnomalies")
NOTIFICATIONS_TABLE = os.environ.get("NOTIFICATIONS_TABLE", "CloudWatchSentinelNotifications")

JWT_SECRET = os.environ.get("JWT_SECRET") or secrets.token_hex(32)
DATABASE_PATH = os.environ.get("DATABASE_PATH", "sentinel.db")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
DEMO_MODE = os.environ.get("DEMO_MODE", "true").lower() in ("true", "1", "yes")
