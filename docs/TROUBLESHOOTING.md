# Troubleshooting Guide – CloudWatch Sentinel

Common questions, local development troubleshooting, and Render cloud platform resolution procedures.

---

## 1. Local Development Issues

### Problem: `sqlite3.OperationalError: database is locked`
- **Cause**: Concurrent thread access to SQLite database file without sufficient connection timeout or WAL journal mode.
- **Resolution**: `repository.py` opens connection with `timeout=60.0` and enables `PRAGMA journal_mode=WAL`.

### Problem: Frontend build fails with `Property 'env' does not exist on type 'ImportMeta'`
- **Cause**: Missing Vite client type declarations.
- **Resolution**: `frontend/src/vite-env.d.ts` provides `/// <reference types="vite/client" />` type definitions.

### Problem: ESLint fails with `React Hook useEffect has a missing dependency`
- **Cause**: Inline function reference in `useEffect` dependency array.
- **Resolution**: Fetch calls are inlined inside `useEffect` or wrapped in `useCallback`.

---

## 2. Render Cloud Deployment Issues

### Problem: Render Web Service fails health check (`GET /health`)
- **Cause**: Backend not listening on `0.0.0.0` or wrong port.
- **Resolution**: Uvicorn command must explicitly specify `--host 0.0.0.0 --port $PORT`.

### Problem: Frontend CORS error when communicating with Render backend
- **Cause**: `FRONTEND_URL` environment variable mismatch on backend.
- **Resolution**: Ensure `FRONTEND_URL` on Render Web Service matches your Render Static Site domain (e.g. `https://cloudwatch-sentinel-ui.onrender.com`).

### Problem: Render Static Site shows 404 or API fetch failure
- **Cause**: `VITE_API_URL` environment variable not set during build.
- **Resolution**: Set `VITE_API_URL=https://cloudwatch-sentinel-api.onrender.com` in Render Static Site environment settings and trigger **Clear cache and deploy**.
