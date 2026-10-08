# Interview & Viva Q&A Guide – CloudWatch Sentinel

High-yield questions and answers for academic project evaluation and technical interviews.

---

## ❓ Frequently Asked Viva Questions

### Q1: Why qualifies this project as a Cloud Application?
**Answer**: CloudWatch Sentinel is architected for public cloud deployment on the **Render Cloud Platform**. It employs a decoupled multi-tier cloud distribution model (Render Static Site for React frontend, Render Web Service for FastAPI REST API), containerization via Docker, environment variable configuration, RESTful HTTPS communications, dynamic CORS security, statistical Z-score anomaly detection, and automated Git deployment integration.

### Q2: How does the Z-score anomaly detection engine work?
**Answer**: The engine computes a population Z-score for daily spend observations:
$$Z = \frac{X - \mu}{\sigma}$$
Where $X$ is current daily spend, $\mu$ is rolling baseline mean, and $\sigma$ is standard deviation. Observations with $Z \ge 2.0$ trigger anomalies classified into `CRITICAL` ($Z \ge 4.0$), `HIGH` ($Z \ge 3.0$), and `MEDIUM` ($Z \ge 2.0$).

### Q3: Who are the team members and what were their roles?
**Answer**:
- **Dinakar S (24BCS405)**: Lead Software Architect & Full Stack Engineer
- **Kabileshwara Y (24BCS411)**: Senior Cloud Architect & Backend Engineer
- **Pranesh Sachin M (24BCS415)**: Senior DevOps & Security Engineer
- **Santhosh TMA (24BCS247)**: Data Analytics & QA Engineer
- **Nikhil R (24BCS190)**: UI/UX & Frontend Engineer
- **Institution**: Kumaraguru College of Technology (KCT)

### Q4: How is data transparency handled?
**Answer**: The UI displays prominent badges (`SIMULATED COST DATA`) and settings disclosures explaining that telemetry data is synthetic for college demonstration purposes. The data collector module is decoupled, enabling seamless replacement with AWS Cost Explorer API (`ce:GetCostAndUsage`) in production.
