import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import init_database
from datetime import datetime
from routes.userRoute import userRouter
from routes.reservaRoute import reservaRouter
from routes.roomRoute import roomRouter
from controller.jwtValidation import validate_jwt

# Configuração do Logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicação...")
    if await init_database():
        logger.info("Base de dados inicializada com sucesso.")
    else:
        logger.error("Erro ao inicializar a base de dados.")
    yield
    logger.info("Encerrando aplicação.")


app = FastAPI(
    title="Reserva de Salas",
    tags=["Reserva de Salas"],
    description=" Uma aplicação de reserva de salas.",
    contact={
        " name ": {" Miguel Gonçalves", "Cleide Ferreira"},
        " email ": "miguelprg@ua.pt",
    },
    lifespan=lifespan,
)

# Middleware para permitir CORS (Cross-Origin Resource Sharing). CORS é necessário para permitir que o frontend acesse a API, especialmente se estiverem em domínios diferentes.

ALLOW_ORIGINS = ["http://localhost:3000", "127.0.0.1"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

PUBLIC_PATHS = {
    "/",
    "/user/login",
    "/user/register",
    "/docs",
    "/openapi.json",
    "/redoc",
}


@app.middleware("http")
async def middleware(request: Request, call_next):

    origin = request.headers.get("origin") or request.client.host
    logger.info(f"Request: {request.method} {request.url.path} - Origin: {origin}")

    if request.method == "OPTIONS":
        response = await call_next(request)
        return response

    if origin not in ALLOW_ORIGINS:
        logger.warning(f"Origem não permitida: {origin}")
        return JSONResponse(status_code=403, content={"detail": "Origem não permitida"})

    # Adicionar datetime ao request state
    request.state.now = datetime.now()

    path = request.url.path

    # rotas públicas
    if path in PUBLIC_PATHS:
        logger.debug(f"Rota pública acedida: {path}")
        response = await call_next(request)
        logger.info(f"Response: {path} - Status {response.status_code}")
        return response

    token = request.cookies.get("token")
    if not token:
        logger.warning(f"Token não fornecido para rota protegida: {path}")
        return JSONResponse(status_code=401, content={"detail": "Não autenticado"})

    try:
        payload = validate_jwt(token)

        if not payload:
            logger.warning(f"Token inválido para rota: {path}")
            return JSONResponse(status_code=401, content={"detail": "Token inválido"}) 

        request.state.user = payload
        logger.debug(
            f"Token validado com sucesso para utilizador: {payload.get('sub')}"
        )
    except Exception as e:
        logger.error(f"Erro na validação de token: {str(e)}")
        return JSONResponse(status_code=401, content={"detail": "Token inválido"})

    response = await call_next(request)
    logger.info(f"Response: {path} - Status {response.status_code}")
    return response


app.include_router(userRouter)
app.include_router(reservaRouter)
app.include_router(roomRouter)


@app.get("/", tags=["Root"], description="Returns a greeting message")
def read_root():
    logger.info("Root endpoint acedido")
    return {"Hello": "World"}
