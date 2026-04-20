import jwt
import os
import secrets
import base64
from datetime import datetime, timedelta, timezone


def _generate_secret() -> str:
    key = base64.urlsafe_b64encode(secrets.token_bytes(64)).decode().rstrip("=")
    print("Guarda esta chave de segurança no .env: ", key)


# Em produção, defina JWT_SECRET_KEY no .env
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or _generate_secret()
ALGORITHM = "HS512"
EXPIRATION_HOURS = 24


def generate_jwt(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=EXPIRATION_HOURS)

    payload = {
        "user_id": user_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def validate_jwt(token: str) -> dict:

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")
