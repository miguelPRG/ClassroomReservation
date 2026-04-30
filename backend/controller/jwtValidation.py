import jwt
import os
import secrets
import base64
from datetime import datetime, timedelta, timezone
from fastapi.responses import JSONResponse
from typing import Dict, Any

# Variável de ambiente para detectar se a aplicação está rodando no Render.com
IS_RENDER = os.getenv("RENDER", "false").lower() == "true"

def _generate_secret() -> str:
    key = base64.urlsafe_b64encode(secrets.token_bytes(64)).decode().rstrip("=")
    print("Guarda esta chave de segurança no .env: ", key)


# Em produção, defina JWT_SECRET_KEY no .env
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or _generate_secret()
ALGORITHM = "HS512"
EXPIRATION_HOURS = 1


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

def create_secure_cookie_response(content, jwt_token, logger=None):
    response = JSONResponse(content=content)
    
    # LOCAL (http://localhost)
    if not IS_RENDER:
        cookie_params = {
            "key": "token",
            "value": jwt_token,
            "httponly": True,
            "secure": False,  # localhost HTTP
            "samesite": "Lax",
            "path": "/",
        }
    # RENDER (HTTPS cross-domain)
    else:
        cookie_params = {
            "key": "token",
            "value": jwt_token,
            "httponly": True,
            "secure": True,
            "samesite": "None",
            "domain": "classroomreservation-4ny3.onrender.com",
            "path": "/",
        }
    
    response.set_cookie(**cookie_params)
    
    # LOG CRÍTICO
    set_cookie_header = response.headers.get('set-cookie', 'MISSING!')
    if logger:
        logger.info(f"Set-Cookie: {set_cookie_header}")
    
    return response
