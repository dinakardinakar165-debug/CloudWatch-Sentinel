import os
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger(__name__)

class SupabaseClient:
    """
    Lightweight, resilient Supabase client using REST API / Realtime endpoints.
    Operates when SUPABASE_URL and SUPABASE_KEY are provided; gracefully no-ops when offline.
    """

    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.enabled = bool(self.url and self.key)
        if self.enabled:
            logger.info("Supabase client initialized with endpoint: %s", self.url)
        else:
            logger.info("Supabase credentials not set. Operating in local SQLite fallback mode.")

    def _headers(self) -> Dict[str, str]:
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def is_connected(self) -> bool:
        if not self.enabled:
            return False
        try:
            resp = httpx.get(f"{self.url}/rest/v1/", headers={"apikey": self.key}, timeout=3.0)
            return resp.status_code < 500
        except Exception:
            return False

    def insert(self, table_name: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        try:
            resp = httpx.post(
                f"{self.url}/rest/v1/{table_name}",
                headers=self._headers(),
                json=payload,
                timeout=5.0
            )
            if resp.status_code in (200, 201):
                res = resp.json()
                return res[0] if isinstance(res, list) and res else res
        except Exception as e:
            logger.warning("Supabase insert error on %s: %s", table_name, e)
        return None

    def upsert(self, table_name: str, payload: Dict[str, Any], on_conflict: str = "id") -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        try:
            headers = self._headers()
            headers["Prefer"] = f"resolution=merge-duplicates,return=representation"
            resp = httpx.post(
                f"{self.url}/rest/v1/{table_name}",
                headers=headers,
                json=payload,
                timeout=5.0
            )
            if resp.status_code in (200, 201):
                res = resp.json()
                return res[0] if isinstance(res, list) and res else res
        except Exception as e:
            logger.warning("Supabase upsert error on %s: %s", table_name, e)
        return None

    def select(self, table_name: str, query_params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        try:
            resp = httpx.get(
                f"{self.url}/rest/v1/{table_name}",
                headers=self._headers(),
                params=query_params or {},
                timeout=5.0
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            logger.warning("Supabase select error on %s: %s", table_name, e)
        return []

supabase = SupabaseClient()
