# API Reference – CloudWatch Sentinel

All request and response bodies use standard JSON (`content-type: application/json`).

---

## Authentication & Authorization

- Public endpoints (`/health`, `/register`, `/login`, `/confirm-registration`, `/anomaly-preview`) require no HTTP headers.
- Protected endpoints (`/connect-account`, `/dashboard`, `/cost-history`, `/anomalies`, `/alerts`, `/demo/generate-cost`) accept an optional or required `Authorization: Bearer <JWT>` header.

---

## Endpoint Definitions

### 1. `GET /health`
Health check endpoint used by Render Web Services for container health monitoring.

**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

---

### 2. `POST /register`
Registers a new user profile with hashed password in the SQLite database and returns a signed JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "UserSub": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
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
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "IdToken": "eyJhbGciOiJIUzI1Ni...",
  "userSub": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "email": "student@example.com"
}
```

---

### 4. `GET /dashboard` / `GET /summary`
Returns aggregate summary statistics, account info, latest daily spend, active anomalies, and recent cost history.

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

### 5. `GET /cost-history`
Returns service-level historical daily cloud cost records across Compute Services, Storage Services, Database Services, Network & CDN, API & Gateways, and Other Cloud Services.

**Response (200 OK):**
```json
[
  { "date": "2026-08-16", "service": "Compute Services", "amount": 185.40, "currency": "USD" },
  { "date": "2026-08-15", "service": "Database Services", "amount": 36.80, "currency": "USD" }
]
```

---

### 6. `GET /anomalies`
Lists all detected cost anomalies with baseline averages, calculated Z-scores, and severity classifications.

**Response (200 OK):**
```json
[
  {
    "anomalyId": "2026-08-16#Compute Services#uuid",
    "date": "2026-08-16",
    "service": "Compute Services",
    "amount": 185.40,
    "baseline": 50.25,
    "zScore": 4.82,
    "severity": "critical",
    "createdAt": "2026-08-17T20:00:00Z"
  }
]
```

---

### 7. `POST /demo/generate-cost`
Generates fresh demo cloud metrics, executes the Z-score anomaly detection engine, saves anomalies and alert notifications to SQLite, and returns execution summary details.

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

---

### 8. `POST /anomaly-preview`
Stateless Z-score anomaly detection calculator.

**Request Body:**
```json
[
  { "date": "2026-08-01", "service": "Compute Services", "amount": 50.0 },
  { "date": "2026-08-02", "service": "Compute Services", "amount": 52.0 },
  { "date": "2026-08-03", "service": "Compute Services", "amount": 48.0 },
  { "date": "2026-08-04", "service": "Compute Services", "amount": 185.40 }
]
```

**Response (200 OK):**
```json
[
  {
    "date": "2026-08-04",
    "service": "Compute Services",
    "amount": 185.40,
    "baseline": 50.0,
    "zScore": 135.35,
    "severity": "critical"
  }
]
```
