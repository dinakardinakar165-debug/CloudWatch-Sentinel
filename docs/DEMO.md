# College Project Demonstration & Viva Guide – CloudWatch Sentinel

**Subject**: Cloud Application and Development  
**Institution**: Kumaraguru College of Technology (KCT)  
**Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 🎬 10-Step Viva & Presentation Routine

### Step 1: Opening & Application Access
- Open the application URL in a web browser (e.g. `https://cloudwatch-sentinel-ui.onrender.com` or local `http://localhost:5173`).
- **Explain**: "CloudWatch Sentinel is a cloud cost intelligence platform designed for monitoring daily infrastructure spend, detecting cost spikes using statistical Z-score algorithms, and issuing proactive alert notifications."

### Step 2: User Authentication & JWT Security
- Click **Register** / **Login** in the sidebar.
- Enter student credentials (`student@kct.ac.in` / `Password123!`) and submit.
- **Point Out**: The `JWT Auth Session` status indicator in the sidebar footer. Explain that user passwords are saved using SHA-256 with static salt hashing and access tokens are signed with HMAC-SHA256.

### Step 3: Executive Overview Dashboard
- Click **Dashboard** in the navigation sidebar.
- Show the 6 top metric cards: Total Cloud Spend, Monthly Forecast, Active Anomalies, Monitored Cloud Resources, Critical Alerts, Monitoring Status.
- Point to the Recharts **Daily Aggregated Spend Trend** AreaChart and **Service Contribution** PieChart.

### Step 4: Cost Analytics & Multi-Chart Breakdown
- Navigate to **Cost Analytics**.
- Review the 4 metrics (Highest Cost Category, Avg Daily Spend, Total Spend, 30-Day Projection).
- Show the AreaChart, BarChart histogram, PieChart, and the detailed Service Spend Breakdown table.

### Step 5: Cloud Resource Pool Telemetry
- Navigate to **Cloud Resources**.
- **Point Out**: The prominent **DEMO CLOUD ENVIRONMENT** badge explaining data source transparency.
- Show the 6 resource category cards: Compute Services, Storage Services, Database Services, Network & CDN, API & Gateways, Other Cloud Services.

### Step 6: Live Cost Spike Simulation
- Click **"⚡ Simulate Cost Event"** in the top navigation header.
- Observe the toast notification banner: *"✓ Simulation Event Complete: 180 telemetry records processed • 1 cost anomaly flagged."*
- Show that the charts and metrics automatically refresh in real-time.

### Step 7: Statistical Z-Score Anomaly Engine & Math Explainer
- Navigate to **Anomalies Engine**.
- Point out the **"How Anomaly Detection Works"** math card displaying:
  $$Z = \frac{X - \mu}{\sigma}$$
- Explain the severity classifications: `CRITICAL` ($Z \ge 4.0$), `HIGH` ($Z \ge 3.0$), `MEDIUM` ($Z \ge 2.0$).
- Show the newly generated anomaly entry: **Compute Services** jumping to **$185.40** with a **Z-Score of 4.82** and **`CRITICAL`** badge.

### Step 8: In-App Alerts & Notifications
- Navigate to **Alerts & Notifications**.
- Review the generated alert card: `[CRITICAL] CRITICAL COST ANOMALY DETECTED`.
- Demonstrate marking alerts as read and severity filtering.

### Step 9: System Health & Live Endpoint Verification
- Navigate to **System Health**.
- Click **"🔄 Run Live Health Check (/health)"**.
- Show the live roundtrip ping latency (ms) and HTTP 200 response status from FastAPI backend.

### Step 10: Settings, KCT Team Roster & Deployment Architecture
- Navigate to **Settings & Team**.
- Present the KCT Engineering Team roster table (24BCS405, 24BCS411, 24BCS415, 24BCS247, 24BCS190).
- Explain the Render Free Tier deployment architecture (Render Web Service + Render Static Site) and SQLite WAL persistence model.
