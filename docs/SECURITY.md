# Security Guide – CloudWatch Sentinel

Security controls and compliance practices implemented in CloudWatch Sentinel.

---

## Security Controls Overview

### 1. Password Hashing & Secret Management
- User passwords are **never stored in plain text**.
- Passwords are hashed using SHA-256 with static salt hashing prior to database insertion (`_hash_password()` in `backend/authentication/service.py`).
- Application secrets (`JWT_SECRET`) are configured strictly via environment variables and excluded from source control.

### 2. JWT Token Authentication & Verification
- Authentication issues JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
- JWT tokens carry user claims (`sub`, `email`, `iat`, `exp`) with a 7-day expiration timeline.
- Protected REST API routes verify JWT token signatures before executing business logic.

### 3. Dynamic CORS Security
- FastAPI backend configures `CORSMiddleware` dynamically matching `FRONTEND_URL`.
- Exposes strict HTTP methods (`GET`, `POST`, `OPTIONS`) and header specifications.

### 4. Input Validation & Exception Isolation
- Input payloads are sanitized and validated using Pydantic data models (`Credentials`, `Confirmation`, `AccountConnection`).
- API errors are wrapped in standard HTTP exceptions without leaking internal stack trace details or sensitive database internals.

### 5. Repository & Git Security
- `.gitignore` excludes `.env`, `*.db`, `node_modules/`, `dist/`, `__pycache__/`, `.terraform/`, and `*.tfstate`.
- Zero secrets committed to the repository.
