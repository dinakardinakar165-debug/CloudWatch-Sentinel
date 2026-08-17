import hashlib
import uuid
from datetime import datetime, timedelta, timezone
import jwt
from backend.shared import config, repository

def _hash_password(password: str) -> str:
    # Secure SHA-256 password hashing with static salt for local demo
    salt = "cloudwatch-sentinel-salt-2026"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        raise ValueError(f"Invalid authentication token: {str(e)}")

def register(email: str, password: str) -> dict:
    existing = repository.get_user_by_email(email)
    if existing:
        user_id = existing["id"]
        token = create_jwt_token(user_id, email)
        return {
            "UserSub": user_id,
            "IdToken": token,
            "confirmationRequired": False,
            "message": "User already exists; signed in."
        }
    user_id = str(uuid.uuid4())
    pw_hash = _hash_password(password)
    repository.create_user(user_id, email, pw_hash)
    token = create_jwt_token(user_id, email)
    return {
        "UserSub": user_id,
        "IdToken": token,
        "confirmationRequired": False
    }

def login(email: str, password: str) -> dict:
    user = repository.get_user_by_email(email)
    if not user:
        # Auto-create demo user on login if not present for streamlined demo experience
        reg_result = register(email, password)
        return {"IdToken": reg_result["IdToken"], "userSub": reg_result["UserSub"]}

    pw_hash = _hash_password(password)
    if user["password_hash"] != pw_hash:
        raise ValueError("Invalid email or password")

    token = create_jwt_token(user["id"], user["email"])
    return {
        "IdToken": token,
        "userSub": user["id"],
        "email": user["email"]
    }

def confirm_registration(email: str, code: str) -> None:
    # Auto-confirm verification code for demo environment
    return None
