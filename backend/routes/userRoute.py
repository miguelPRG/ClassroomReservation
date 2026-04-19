import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from models.userModel import UserCreate, UserLogin, UserLogout, UserGet
import database
from bson import ObjectId
from pwdlib import PasswordHash
from controller.jwtValidation import generate_jwt

userRouter = APIRouter(prefix="/user", tags=["User"])
password_hash = PasswordHash.recommended()
logger = logging.getLogger(__name__)


@userRouter.post(
    "/register",
    summary="Criar um novo utilizador",
    response_model=UserGet,
    responses={
        400: {"description": "Utilizador já existe"},
        500: {"description": "Erro ao criar utilizador"},
    },
)
async def create_user(user: UserCreate, request: Request):
    """
    Cria um novo utilizador. Verifica se o email já existe, e se não existir, insere o novo utilizador na base de dados com a password hashada e as datas de criação e atualização.
    """

    existing_user = await database.user_collection.find_one({"email": user.email})

    if existing_user:
        logger.warning(f"Tentativa de registo com email já existente: {user.email}")
        raise HTTPException(
            status_code=400, detail="Já existe um utilizador com esse email"
        )

    user_dict = user.model_dump()
    user_dict["password"] = password_hash.hash(user.password)
    user_dict["role"] = "user"
    user_dict["created_at"] = request.state.now
    user_dict["updated_at"] = request.state.now
    user_dict["last_login"] = None

    try:
        new_user = await database.user_collection.insert_one(user_dict)
        new_user_id = new_user.inserted_id
    except Exception as e:
        logger.error(f"Erro ao criar utilizador {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Erro ao criar utilizador: {str(e)}"
        )

    jwt_token = generate_jwt(str(new_user_id), user_dict["role"])

    response = JSONResponse(
        content={
            UserGet(
                id=str(new_user_id),
                nome=user.nome,
                email=user.email,
            ).model_dump()
        }
    )
    response.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=24 * 3600,
    )
    return response


@userRouter.post(
    "/login",
    summary="Autenticar um utilizador",
    response_model=UserGet,
    responses={
        400: {"description": "Email ou password inválidos"},
    },
)
async def login_user(user: UserLogin, request: Request):
    """Autentica um utilizador. Verifica se o email existe e se a password é correta. Se a autenticação for bem-sucedida, gera um token JWT, atualiza a data do último login e retorna uma resposta com o token definido como cookie."""

    existing_user = await database.user_collection.find_one({"email": user.email})

    if not existing_user or not password_hash.verify(
        user.password, existing_user["password"]
    ):
        logger.warning(f"Falha de login para email: {user.email}")
        raise HTTPException(status_code=400, detail="Email ou password inválidos")

    jwt_token = generate_jwt(str(existing_user["_id"]), existing_user["role"])

    await database.user_collection.update_one(
        {"_id": existing_user["_id"]}, {"$set": {"last_login": request.state.now}}
    )

    response = JSONResponse(
        content=UserGet(
            id=str(existing_user["_id"]),
            nome=existing_user.get("nome"),
            email=existing_user.get("email"),
        ).model_dump()
    )
    response.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/",
        max_age=3600,
    )

    logger.info(f"Login bem-sucedido para email: {user.email}")

    return response


@userRouter.post(
    "/logout",
    summary="Logout do utilizador",
    response_model=UserLogout,
)
async def logout_user():
    """
    Faz logout de um utilizador. Remove o cookie do token JWT para efetuar o logout do utilizador.
    """
    response = JSONResponse(content={"message": "Logout bem-sucedido"})
    response.delete_cookie(key="token")
    return response


@userRouter.get(
    "/me",
    summary="Ler informações do utilizador autenticado",
    response_model=UserGet,
    responses={
        401: {"description": "Utilizador não encontrado"},
    },
)
async def auth_user(request: Request):
    """Verifica o token JWT do utilizador. Se o token for válido, retorna as informações do utilizador. Se o token for inválido ou expirado, retorna um erro de autenticação."""

    jwt = request.state.user

    user_id = ObjectId(jwt["user_id"])

    user = await database.user_collection.find_one({"_id": user_id})

    if not user:
        logger.warning(
            f"Utilizador não encontrado para token com user_id={jwt.get('user_id')}"
        )
        response = JSONResponse(
            status_code=401, content={"detail": "Utilizador não encontrado"}
        )
        response.delete_cookie(key="token")
        return response

    return UserGet(
        id=str(user["_id"]),
        nome=user.get("nome"),
        email=user.get("email"),
    )
