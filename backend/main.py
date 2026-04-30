import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import init_database, init_indexes
from datetime import datetime, timezone, timedelta
from routes.userRoute import userRouter
from routes.reservaRoute import reservaRouter
from routes.roomRoute import roomRouter
from controller.jwtValidation import validate_jwt
from collections import defaultdict

# Configuração do Logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Rate Limiting - Anti-DDoS/Brute Force
# Estrutura: {ip: {"count": int, "timestamp": datetime, "bloqueado_ate": datetime}}
ip_requests = defaultdict(lambda: {"count": 0, "timestamp": None, "bloqueado_ate": None})
RATE_LIMIT_REQUESTS = 15  # máximo de requisições
RATE_LIMIT_WINDOW = 30  # segundos
RATE_LIMIT_BLOCK_DURATION = 120  # 2 minutos em segundos

# Variável de ambiente para detectar se a aplicação está rodando no Render.com
IS_RENDER = os.getenv("RENDER", "false").lower() == "true"



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicação...")
    if await init_database():
        logger.info("Base de dados inicializada com sucesso.")
        if await init_indexes():
            logger.info("Índices inicializados com sucesso.")
        else:
            logger.warning("Erro ao inicializar índices.")
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
        " email ": {"miguelprg@ua.pt", "ccsf@ua.pt"},
    },
    lifespan=lifespan,
)

# Middleware para permitir CORS (Cross-Origin Resource Sharing). CORS é necessário para permitir que o frontend acesse a API, especialmente se estiverem em domínios diferentes.

# CORS - Aceita requisições do frontend local em desenvolvimento
ALLOW_ORIGINS_DEV = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://classroom-reservation-bkde.vercel.app"
]

# Esta variável de ambiente é definida no docker-compose.yml para produção, e pode ser usada para ajustar o comportamento da aplicação (ex: aceitar apenas tráfego do proxy interno do frontend em produção, mas permitir localhost em desenvolvimento).
APP_ENV = os.getenv("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"
INTERNAL_PROXY_HEADER = "x-internal-proxy"
INTERNAL_PROXY_VALUE = "app-frontend"

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS_DEV,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

PUBLIC_PATHS = {
    "/user/login",
    "/user/register",
}

INFO_PATHS = {
    "/",
    "/docs",
    "/openapi.json",
    "/redoc",
}


@app.middleware("http")
async def middleware(request: Request, call_next):
    # === RATE LIMITING - Anti-DDoS/Brute Force ===
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc)
    
    # Verificar se o IP está bloqueado
    if ip_requests[client_ip]["bloqueado_ate"] and now < ip_requests[client_ip]["bloqueado_ate"]:
        logger.warning(f"IP bloqueado (rate limit): {client_ip}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Demasiadas requisições. Tenta novamente mais tarde."},
        )
    
    # Resetar contador se a janela de 30 segundos expirou
    if ip_requests[client_ip]["timestamp"] is None or (now - ip_requests[client_ip]["timestamp"]).total_seconds() > RATE_LIMIT_WINDOW:
        ip_requests[client_ip] = {"count": 1, "timestamp": now, "bloqueado_ate": None}
    else:
        # Incrementar contador
        ip_requests[client_ip]["count"] += 1
        
        # Bloquear se exceder limite
        if ip_requests[client_ip]["count"] > RATE_LIMIT_REQUESTS:
            ip_requests[client_ip]["bloqueado_ate"] = now + timedelta(seconds=RATE_LIMIT_BLOCK_DURATION)
            logger.warning(
                f"IP bloqueado (rate limit): {client_ip} - "
                f"Limite de {RATE_LIMIT_REQUESTS} requisições em {RATE_LIMIT_WINDOW}s excedido"
            )
            return JSONResponse(
                status_code=429,
                content={"detail": "Demasiadas requisições. Tenta novamente mais tarde."},
            )

    origin = request.headers.get("origin")
    logger.info(f"Request: {request.method} {request.url.path} - Origin: {origin} - IP: {client_ip}")

    if request.method == "OPTIONS":
        response = await call_next(request)
        return response

    if IS_PRODUCTION:
        
        # Em produção, só aceita tráfego que chega pelo proxy interno do frontend.
        proxy_marker = request.headers.get(INTERNAL_PROXY_HEADER)
        if proxy_marker != INTERNAL_PROXY_VALUE:
            logger.warning(
                "Pedido rejeitado fora do proxy interno: "
                f"path={request.url.path}, {INTERNAL_PROXY_HEADER}={proxy_marker}"
            )
            return JSONResponse(
                status_code=403,
                content={"detail": "Acesso permitido apenas via frontend"},
            )
    else:
        # Em desenvolvimento, permite origem local do frontend.
        if origin and origin not in ALLOW_ORIGINS_DEV:
            logger.warning(f"Origem não permitida: {origin}")
            return JSONResponse(
                status_code=403,
                content={"detail": "Origem não permitida"},
            )

    # Adicionar datetime UTC ao request state
    request.state.now = datetime.now(timezone.utc)

    path = request.url.path

    # Rotas públicas - não requerem autenticação
    if path in PUBLIC_PATHS:

        logger.debug(f"Rota pública acedida: {path}")
        response = await call_next(request)
        logger.info(f"Response: {path} - Status {response.status_code}")
        return response

    # Rotas de documentação - estas rotas devem estar desativadas em produção, mas podem ser acessadas sem autenticação em desenvolvimento para facilitar testes.
    if path in INFO_PATHS and not IS_RENDER:
        logger.warning(f"Rota de documentação acedida: {path}")
        return JSONResponse(
            status_code=403,
            content={"detail": "Acesso à documentação restrito em produção"},
        )

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
