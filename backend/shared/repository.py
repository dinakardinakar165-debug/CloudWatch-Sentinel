import json
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from . import config

def _get_connection():
    conn = sqlite3.connect(config.DATABASE_PATH, timeout=60.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = _get_connection()
    try:
        conn.execute("PRAGMA journal_mode=WAL")
    except Exception:
        pass
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            user_id TEXT PRIMARY KEY,
            account_name TEXT NOT NULL,
            role_arn TEXT NOT NULL,
            external_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cost_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            record_id TEXT NOT NULL,
            date TEXT NOT NULL,
            service TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            collected_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS anomalies (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            anomaly_id TEXT NOT NULL,
            date TEXT NOT NULL,
            service TEXT NOT NULL,
            amount REAL NOT NULL,
            baseline REAL NOT NULL,
            z_score REAL NOT NULL,
            severity TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            notification_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL,
            created_at TEXT NOT NULL,
            read INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

# Auto initialize database schema on import
init_db()

# User repository methods
def get_user_by_email(email: str) -> Optional[dict]:
    conn = _get_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def create_user(user_id: str, email: str, password_hash: str) -> dict:
    conn = _get_connection()
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("INSERT OR REPLACE INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                   (user_id, email, password_hash, created_at))
    conn.commit()
    conn.close()
    return {"id": user_id, "email": email, "created_at": created_at}

# Account repository methods
def get_account(user_id: str) -> Optional[dict]:
    conn = _get_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM accounts WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    if row:
        return {
            "userId": row["user_id"],
            "accountName": row["account_name"],
            "roleArn": row["role_arn"],
            "externalId": row["external_id"],
            "createdAt": row["created_at"]
        }
    return None

def save_account(user_id: str, account_name: str, role_arn: str, external_id: str) -> dict:
    conn = _get_connection()
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT OR REPLACE INTO accounts (user_id, account_name, role_arn, external_id, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_id, account_name, role_arn, external_id, created_at)
    )
    conn.commit()
    conn.close()
    return {
        "userId": user_id,
        "accountName": account_name,
        "roleArn": role_arn,
        "externalId": external_id,
        "createdAt": created_at
    }

# Cost History repository methods
def save_cost(user_id: str, date: str, service: str, amount: float, currency: str = "USD") -> dict:
    conn = _get_connection()
    cursor = conn.cursor()
    record_id = f"{date}#{service}"
    row_id = f"{user_id}#{record_id}"
    collected_at = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT OR REPLACE INTO cost_history (id, user_id, record_id, date, service, amount, currency, collected_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (row_id, user_id, record_id, date, service, float(amount), currency, collected_at)
    )
    conn.commit()
    conn.close()
    return {"userId": user_id, "recordId": record_id, "date": date, "service": service, "amount": float(amount), "currency": currency, "collectedAt": collected_at}

def list_costs(user_id: str, limit: int = 90) -> List[dict]:
    conn = _get_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT date, service, amount, currency FROM cost_history WHERE user_id = ? ORDER BY date DESC, amount DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [{"date": row["date"], "service": row["service"], "amount": float(row["amount"]), "currency": row["currency"]} for row in rows]

# Anomaly repository methods
def save_anomaly(user_id: str, anomaly: dict) -> dict:
    conn = _get_connection()
    cursor = conn.cursor()
    anomaly_id = anomaly.get("anomalyId") or f"{anomaly['date']}#{anomaly['service']}#{datetime.now(timezone.utc).timestamp()}"
    row_id = f"{user_id}#{anomaly_id}"
    created_at = anomaly.get("createdAt") or datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT OR REPLACE INTO anomalies (id, user_id, anomaly_id, date, service, amount, baseline, z_score, severity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (row_id, user_id, anomaly_id, anomaly["date"], anomaly["service"], float(anomaly["amount"]), float(anomaly["baseline"]), float(anomaly["zScore"]), anomaly["severity"], created_at)
    )
    conn.commit()
    conn.close()
    return {**anomaly, "userId": user_id, "anomalyId": anomaly_id, "createdAt": created_at}

def list_anomalies(user_id: str, limit: int = 50) -> List[dict]:
    conn = _get_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT anomaly_id, date, service, amount, baseline, z_score, severity, created_at FROM anomalies WHERE user_id = ? ORDER BY date DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [{
        "anomalyId": row["anomaly_id"],
        "date": row["date"],
        "service": row["service"],
        "amount": float(row["amount"]),
        "baseline": float(row["baseline"]),
        "zScore": float(row["z_score"]),
        "severity": row["severity"],
        "createdAt": row["created_at"]
    } for row in rows]

# Notification repository methods
def save_notification(user_id: str, title: str, message: str, severity: str) -> dict:
    conn = _get_connection()
    cursor = conn.cursor()
    notification_id = f"notif-{datetime.now(timezone.utc).timestamp()}"
    row_id = f"{user_id}#{notification_id}"
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT OR REPLACE INTO notifications (id, user_id, notification_id, title, message, severity, created_at, read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
        (row_id, user_id, notification_id, title, message, severity, created_at)
    )
    conn.commit()
    conn.close()
    return {"notificationId": notification_id, "userId": user_id, "title": title, "message": message, "severity": severity, "createdAt": created_at}

def list_notifications(user_id: str, limit: int = 50) -> List[dict]:
    conn = _get_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        "SELECT notification_id, title, message, severity, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [{
        "notificationId": row["notification_id"],
        "title": row["title"],
        "message": row["message"],
        "severity": row["severity"],
        "createdAt": row["created_at"]
    } for row in rows]

# DynamoDB compatibility table helper class for existing collector code
class TableAdapter:
    def __init__(self, table_name: str):
        self.table_name = table_name

    def put_item(self, Item: dict):
        user_id = Item.get("userId", "default-user")
        if "Accounts" in self.table_name:
            save_account(user_id, Item.get("accountName", "Demo Cloud Account"), Item.get("roleArn", "arn:demo:iam::123:role/demo"), Item.get("externalId", "x"*16))
        elif "Cost" in self.table_name:
            save_cost(user_id, Item["date"], Item["service"], Item["amount"], Item.get("currency", "USD"))
        elif "Anomalies" in self.table_name:
            save_anomaly(user_id, Item)
        elif "Notifications" in self.table_name:
            save_notification(user_id, Item.get("title", "Alert"), Item.get("message", ""), Item.get("severity", "medium"))
        return {}

    def scan(self, ExclusiveStartKey=None):
        conn = _get_connection()
        cursor = conn.cursor()
        rows = cursor.execute("SELECT * FROM accounts").fetchall()
        conn.close()
        items = [{
            "userId": r["user_id"],
            "accountName": r["account_name"],
            "roleArn": r["role_arn"],
            "externalId": r["external_id"],
            "createdAt": r["created_at"]
        } for r in rows]
        return {"Items": items}

    def get_item(self, Key: dict):
        user_id = Key.get("userId")
        acc = get_account(user_id)
        if acc:
            return {"Item": acc}
        return {}

def table(name: str) -> TableAdapter:
    return TableAdapter(name)
