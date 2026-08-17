# Interview & Presentation Guide – CloudWatch Sentinel

This guide provides high-yield questions, answers, and architectural explanations for college project presentations and technical interviews.

---

## Technical & Cloud Architecture Q&A

### 1. Why qualifies this project as a Cloud Application?
**Answer**: CloudWatch Sentinel is architected and deployed on a real public cloud platform (**Render Cloud Platform**). It features a multi-tier cloud distribution model (Render Static Site for React frontend, Render Web Service for FastAPI REST API), containerization via Docker, environment-based configuration, RESTful HTTPS communication, CORS access control, statistical anomaly detection, and automated CI/CD pipeline integration.

### 2. How does the Z-score anomaly detection engine work?
**Answer**: The anomaly engine calculates a population Z-score for each cloud service spend observation:
$$Z = \frac{X - \mu}{\sigma}$$
Where $X$ is current spend, $\mu$ is rolling mean of baseline spend, and $\sigma$ is standard deviation. When $Z \ge 2.0$, the engine flags a cost anomaly categorized by severity:
- **Medium**: $2.0 \le Z < 3.0$
- **High**: $3.0 \le Z < 4.0$
- **Critical**: $Z \ge 4.0$

### 3. Why use Render Free Tier over AWS for this college demonstration?
**Answer**: Render Free Tier provides full cloud functionality (public HTTPS URLs, Docker Web Service container execution, Static Site hosting, environment variable management, and automated Git deployments) without requiring credit card payments or risking unexpected cloud billing charges.

### 4. How is data persisted in the cloud-independent architecture?
**Answer**: Data is persisted using an auto-initialized SQLite database repository (`sentinel.db`) with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) and 60-second connection timeouts. It provides structured storage for `users`, `accounts`, `cost_history`, `anomalies`, and `notifications`.

### 5. How are security and secrets managed?
**Answer**: Authentication relies on HMAC-SHA256 signed JWT tokens. Passwords are hashed using SHA-256 with static salt before database storage. Application secrets (`JWT_SECRET`, `VITE_API_URL`, `FRONTEND_URL`) are injected via environment variables and excluded from Git commits via `.gitignore`.
