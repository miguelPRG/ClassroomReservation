from http.client import responses

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from models.userModel import UserCreate, UserLogin
import database
from bson import ObjectId
from pwdlib import PasswordHash
from datetime import datetime
from controller.jwtValidation import generate_jwt

userRouter = APIRouter(prefix="/user", tags=["User"])
password_hash = PasswordHash.recommended()

@userRouter.post(
    "/register", 
    summary="Criar um novo utilizador",
    responses={
        400: {"description": "Utilizador já existe"},
        500: {"description": "Erro ao criar utilizador"}
    },
    
)
async def create_user(user: UserCreate):
    """
    Cria um novo utilizador. Verifica se o email já existe, e se não existir, insere o novo utilizador na base de dados com a password hashada e as datas de criação e atualização.
    """

    existing_user = await database.user_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Já existe um utilizador com esse email")

    user_dict = user.model_dump()
    user_dict["password"] = password_hash.hash(user.password)
    data = datetime.now()
    user_dict["created_at"] = data
    user_dict["updated_at"] = data
    user_dict["last_login"] = None

    try:
        await database.user_collection.insert_one(user_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar utilizador: {str(e)}")

    return {"message": "Utilizador criado com sucesso"}

@userRouter.post("/login", 
    summary="Autenticar um utilizador",
    responses={
        400: {"description": "Email ou password inválidos"},
    }
)

async def login_user(user: UserLogin):
    """Autentica um utilizador. Verifica se o email existe e se a password é correta. Se a autenticação for bem-sucedida, gera um token JWT, atualiza a data do último login e retorna uma resposta com o token definido como cookie."""

    existing_user = await database.user_collection.find_one({"email": user.email})

    if not existing_user or not password_hash.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Email ou password inválidos")

    jwt_token = generate_jwt(str(existing_user["_id"]))

    await database.user_collection.update_one(
        {"_id": existing_user["_id"]},
        {"$set": {"last_login": datetime.now()}}
    )

    response = JSONResponse(content={"message": "Login bem-sucedido"})
    response.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=24 * 3600
    )
    return response

@userRouter.post("/logout", summary="Logout do utilizador")
async def logout_user():
    """
    Faz logout de um utilizador. Remove o cookie do token JWT para efetuar o logout do utilizador.
    """
    response = JSONResponse(content={"message": "Logout bem-sucedido"})
    response.delete_cookie(key="token")
    return response

@userRouter.get("/auth", summary="Read JWT token and return user info", responses={
    
})
async def auth_user(request: Request):
    """Verifica o token JWT do utilizador. Se o token for válido, retorna as informações do utilizador. Se o token for inválido ou expirado, retorna um erro de autenticação."""
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Token de autenticação não encontrado")

    jwt = request.state.user

    user_id = ObjectId(jwt["user_id"])

    user = await database.user_collection.find_one({"_id": user_id})

    if not user:
        response = JSONResponse(
            status_code=401,
            content={"detail": "Utilizador não encontrado"}
        )
        response.delete_cookie(key="token")
        return response

    return {
        "message": "Utilizador autenticado",
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email")
        }
    }

