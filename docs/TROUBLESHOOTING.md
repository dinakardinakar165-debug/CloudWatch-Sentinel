# Troubleshooting Guide – CloudWatch Sentinel

Resolutions for common development and cloud deployment issues.

---

## 🛠 Common Scenarios & Solutions

### 1. SQLite Database Connection Lock
- **Symptom**: `sqlite3.OperationalError: database is locked`
- **Resolution**: `repository.py` configures connection timeout `timeout=60.0` and initializes Write-Ahead Logging (`PRAGMA journal_mode=WAL`).

### 2. Render Free Tier Cold Start Delay
- **Symptom**: First API request after 15 minutes takes 30-40 seconds.
- **Resolution**: Expected behavior on Render Free Tier when Web Services sleep after inactivity.

### 3. Missing Demo Data After Container Restart
- **Symptom**: Database tables empty after redeployment.
- **Resolution**: FastAPI `lifespan` handler automatically runs `init_db()` and seeds 30 days of baseline cloud cost metrics upon server startup.
