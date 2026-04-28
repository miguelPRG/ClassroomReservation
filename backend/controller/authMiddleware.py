from fastapi import HTTPException, Request

def require_admin(request: Request) -> None:
    """Verifica se o utilizador é administrador. Lança exceção se não for."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem executar esta ação")


def get_user_id(request: Request) -> str:
    """Obtém o ID do utilizador autenticado."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    return user.get("user_id")


def get_user_role(request: Request) -> str:
    """Obtém o role do utilizador autenticado."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    return user.get("role", "user")
