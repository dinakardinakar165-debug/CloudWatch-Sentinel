# REST API Documentation – CloudWatch Sentinel

All request and response bodies use standard JSON (`content-type: application/json`).

---

## 🔒 Authentication & Headers

- **Public Endpoints**: `/health`, `/register`, `/login`, `/confirm-registration`, `/anomaly-preview`
- **Protected Endpoints**: `/connect-account`, `/dashboard`, `/cost-history`, `/anomalies`, `/alerts`, `/demo/generate-cost` require header `Authorization: Bearer <JWT_TOKEN>`.

---

## 📡 Endpoint Specifications

### 1. `GET /health`
Returns health status of the backend API engine.

**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

---

### 2. `POST /register`
Registers a new user account and returns a signed JWT token.

**Request Body:**
```json
{
  "email": "student@kct.ac.in",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "UserSub": "user-uuid-v4-string",
  "IdToken": "eyJhbGciOiJIUzI1Ni...",
  "confirmationRequired": false
}
```

---

### 3. `POST /login`
Authenticates credentials and returns a JWT ID token.

**Request Body:**
```json
{
  "email": "student@kct.ac.in",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "IdToken": "eyJhbGciOiJIUzI1Ni...",
  "userSub": "user-uuid-v4-string",
  "email": "student@kct.ac.in"
}
```

---

### 4. `GET /dashboard` / `GET /summary`
Returns aggregated summary statistics, account metadata, latest spend, active anomalies, and recent trend.

**Response (200 OK):**
```json
{
  "account": {
    "accountName": "Demo Cloud Account",
    "roleArn": "arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly",
    "externalId": "sentinel-demo-ext-12345"
  },
  "latestDailyCost": 185.40,
  "anomalyCount": 1,
  "recentAnomalies": [
    {
      "date": "2026-08-16",
      "service": "Compute Services",
      "amount": 185.40,
      "baseline": 50.25,
      "zScore": 4.82,
      "severity": "critical"
    }
  ],
  "costHistory": [
    { "date": "2026-08-16", "service": "Compute Services", "amount": 185.40, "currency": "USD" }
  ]
}
```

---

### 5. `POST /demo/generate-cost`
Triggers synthetic cost generation and executes the Z-score anomaly engine.

**Response (200 OK):**
```json
{
  "message": "Demo cloud cost update generated successfully",
  "details": {
    "status": "success",
    "recordsProcessed": 180,
    "anomaliesDetected": 1
  }
}
```
