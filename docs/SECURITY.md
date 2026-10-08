# Security Controls & Compliance – CloudWatch Sentinel

Security architectural practices implemented across CloudWatch Sentinel.

---

## 🔒 Security Practices & Architecture

### 1. Password Hashing & Salt Management
- Passwords are **never stored in plain text**.
- `_hash_password()` in `backend/authentication/service.py` uses SHA-256 with static salt hashing before database insertion.

### 2. JWT Token Security
- HMAC-SHA256 signed JSON Web Tokens (`HS256`).
- Secret key dynamically injected via `JWT_SECRET` environment variable or dynamic runtime secret generator (`secrets.token_hex(32)`).

### 3. Dynamic CORS Policies
- FastAPI `CORSMiddleware` dynamically parses allowed origin lists from `FRONTEND_URL` without allowing wildcard origins in production.

### 4. Git & Repository Security
- `.gitignore` explicitly excludes `.env`, `sentinel.db`, `node_modules/`, `dist/`, `__pycache__/`, `.terraform/`, and credentials.
- Zero credentials or API keys committed to source control.
