# Deployment Guide – Render Cloud Platform & AWS Reference

This guide provides step-by-step instructions for deploying CloudWatch Sentinel to **Render Cloud Platform (Free Tier)**, along with local testing procedures and AWS Terraform reference commands.

---

## Part 1: Render Cloud Platform Deployment (Free Tier)

Render allows zero-cost deployment of both the FastAPI backend (Render Web Service) and the React frontend (Render Static Site).

### Step 1: Render Web Service (FastAPI Backend)

1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing `CloudWatch-Sentinel`.
4. Configure the Web Service:
   - **Name**: `cloudwatch-sentinel-api`
   - **Region**: Oregon (US West) or preferred region
   - **Branch**: `main` (or `master`)
   - **Runtime**: `Python 3` (or `Docker`)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Environment Variables:
   - `JWT_SECRET`: Click **Generate** (or enter a random secret string)
   - `DATABASE_PATH`: `sentinel.db`
   - `FRONTEND_URL`: `https://cloudwatch-sentinel-ui.onrender.com`
   - `DEMO_MODE`: `true`
6. Click **Create Web Service**. Note your backend public URL (e.g. `https://cloudwatch-sentinel-api.onrender.com`).

---

### Step 2: Render Static Site (React + Vite Frontend)

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Configure the Static Site:
   - **Name**: `cloudwatch-sentinel-ui`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL`: Enter your Render Web Service backend URL (e.g. `https://cloudwatch-sentinel-api.onrender.com`).
5. Click **Create Static Site**.
6. Once built, open your public HTTPS URL (e.g. `https://cloudwatch-sentinel-ui.onrender.com`).

---

### Step 3: Render Blueprint Deployment (render.yaml)

Alternatively, click **New +** -> **Blueprint** in Render Dashboard, select your repository, and Render will automatically parse [render.yaml](file:///D:/Projects/CloudWatch-Sentinel/render.yaml) to provision both services on the Free plan automatically!

---

## Part 2: Local Testing & Validation Commands

```powershell
# 1. Run backend unit test suite (21 passing tests)
python -m pytest

# 2. Test frontend linting & building
cd frontend
npm run lint
npm run build

# 3. Test Docker container build locally
cd ..
docker build -t cloudwatch-sentinel-api .
docker compose up -d
```

---

## Part 3: AWS Terraform Reference (Optional Future Deployment)

The repository retains full AWS Terraform IaC configuration in `terraform/`:

```powershell
cd terraform
terraform fmt -check -recursive
terraform init
terraform validate
# Note: terraform apply requires AWS credentials and will create billable AWS resources.
```
