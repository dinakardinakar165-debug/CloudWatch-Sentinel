# Deployment Guide – Render Cloud Platform

Step-by-step instructions for deploying CloudWatch Sentinel to the **Render Cloud Platform (Free Tier)** using the 1-Click Blueprint specification.

---

## ☁️ 1-Click Render Blueprint Deployment

1. Push your repository code to GitHub:
   ```powershell
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** (top right) -> Select **Blueprint**.
4. Connect your GitHub repository `CloudWatch-Sentinel`.
5. Render will automatically parse [render.yaml](file:///D:/Projects/CloudWatch-Sentinel/render.yaml) and provision both services:
   - **`cloudwatch-sentinel-api`** (Render Web Service - FastAPI Backend)
   - **`cloudwatch-sentinel-ui`** (Render Static Site - React Frontend)
6. Click **Apply Blueprint**.

---

## ⚙️ Environment Variables Summary

| Service | Environment Variable | Key Type | Value / Purpose |
| :--- | :--- | :--- | :--- |
| Backend | `JWT_SECRET` | Secret | `generateValue: true` (Render Auto-Generated) |
| Backend | `DATABASE_PATH` | String | `sentinel.db` |
| Backend | `DEMO_MODE` | Boolean | `true` |
| Backend | `FRONTEND_URL` | Service Reference | `fromService: cloudwatch-sentinel-ui (RENDER_EXTERNAL_URL)` |
| Frontend | `VITE_API_URL` | Service Reference | `fromService: cloudwatch-sentinel-api (RENDER_EXTERNAL_URL)` |

---

## 🛠 Local Docker Deployment (Optional)

```powershell
# Build Docker image locally
docker build -t cloudwatch-sentinel-api .

# Run with Docker Compose
docker compose up -d
```
