import os
from dotenv import load_dotenv
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
    AsyncIOMotorCollection,
)
from pymongo.errors import PyMongoError
from datetime import datetime, timezone
from bson import ObjectId

load_dotenv()  # garante leitura do .env

MONGO_URI = os.getenv("MONGO_URL")
MONGO_DB_NAME = "Web"

if not MONGO_URI:
    raise RuntimeError("MONGO_URL não foi carregada do .env")

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None

# Exportáveis para outros ficheiros
user_collection: AsyncIOMotorCollection | None = None
sala_collection: AsyncIOMotorCollection | None = None
user_sala_collection: AsyncIOMotorCollection | None = None


async def init_database(uri: str | None = None, db_name: str | None = None) -> bool:
    global client, db, user_collection, sala_collection, user_sala_collection

    mongo_uri = uri or MONGO_URI
    mongo_db_name = db_name or MONGO_DB_NAME

    tmp_client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
    try:
        await tmp_client.admin.command("ping")
        print("Conexão com MongoDB bem-sucedida.")
        client = tmp_client
        db = client[mongo_db_name]

        user_collection = db["users"]
        sala_collection = db["salas"]
        user_sala_collection = db["user_salas"]
        return True
    except PyMongoError:
        tmp_client.close()
        client = None
        db = None
        user_collection = None
        sala_collection = None
        user_sala_collection = None
        return False


async def init_indexes() -> bool:
    """Inicializa índices na base de dados. Retorna True se bem-sucedido, False caso contrário."""
    if user_sala_collection is None:
        return False
    
    try:
        # Obter índices existentes
        existing_indexes = await user_sala_collection.list_indexes().to_list(None)
        index_names = {idx["name"] for idx in existing_indexes}
        
        # Criar índice de unicidade para evitar conflitos de agendamento
        index_name = "room_id_1_start_datetime_1"
        if index_name not in index_names:
            await user_sala_collection.create_index(
                [("room_id", 1), ("start_datetime", 1)],
                unique=True,
                name=index_name
            )
            print(f"Índice '{index_name}' criado com sucesso.")
        else:
            print(f"Índice '{index_name}' já existe.")
        
        return True
    except Exception as e:
        print(f"Erro ao criar índices: {str(e)}")
        return False


def get_reservation_state(start_datetime, end_datetime, current_estado: str, now: datetime) -> str:
    """Determina o estado correto de uma reserva baseado nas datas.
    
    Estados:
    - "reservada": não iniciou ainda
    - "ativa": está no intervalo de tempo
    - "expirada": já terminou
    """
    
    # Garantir que todos os datetimes são timezone-aware (UTC)
    if start_datetime.tzinfo is None:
        start_datetime = start_datetime.replace(tzinfo=timezone.utc)
    if end_datetime.tzinfo is None:
        end_datetime = end_datetime.replace(tzinfo=timezone.utc)
    
    # Se já está marcada como expirada, manter
    if current_estado == "expirada":
        return "expirada"
    
    if now >= start_datetime and now <= end_datetime:
        return "ativa"
    elif now > end_datetime:
        return "expirada"
    else:
        return "reservada"


async def check_room_is_free(room_id: ObjectId) -> bool:
    """Verifica se uma sala está livre (sem reservas ativas ou reservadas)."""
    if user_sala_collection is None:
        return True

    try:
        active_or_reserved_reservation = await user_sala_collection.find_one({
            "room_id": room_id,
            "estado": "ativa"    
        })

        print(f"Reserva encontrada para a sala {room_id}: {active_or_reserved_reservation is not None}")

        # Se não houver reservas ativas ou reservadas, a sala está livre
        return active_or_reserved_reservation is None
    except Exception as e:
        print(f"Erro ao verificar se sala está livre: {str(e)}")
        return True
