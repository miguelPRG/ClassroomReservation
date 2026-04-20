from asyncio.log import logger
from urllib import request

from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId
from models.roomModel import RoomCreate, Room, RoomUpdate, RoomMessage
import database
from pymongo.errors import DuplicateKeyError
import logging

roomRouter = APIRouter(prefix="/room", tags=["Rooms"])

logger = logging.getLogger(__name__)

# 🔹 Criar sala
@roomRouter.post(
    "/",
    summary="Criar uma nova sala",
    response_model=RoomMessage,
    responses={
        400: {"description": "Dados de sala inválidos"},
        500: {"description": "Erro ao criar sala"},
    },
)
async def create_room(room: RoomCreate, request: Request):
    """
    Cria uma nova sala com oPartial<CreateRoomPayload>) => detalhes fornecidos de RoomCreate
    """
    room_dict = room.model_dump()
    room_dict["isFree"] = True
    room_dict["created_at"] = request.state.now
    room_dict["updated_at"] = request.state.now

    try:
        result = await database.sala_collection.insert_one(room_dict)

        if result.inserted_id:
            logger.info(f"Sala criada com ID: {result.inserted_id}")
        else:
            logger.error("Falha ao criar sala: ID de inserção não retornado")
            raise HTTPException(status_code=500, detail="Erro ao criar sala: ID de inserção não retornado")

    except DuplicateKeyError:
        logger.warning(f"Já existe sala com esse nome: {room.name}")
        raise HTTPException(status_code=400, detail="Já existe uma sala com esse nome")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar sala: {str(e)}")

    return RoomMessage(message="Sala criada com sucesso")


# 🔹 Listar todas as salas
@roomRouter.get(
    "/",
    summary="Listar todas as salas",
    response_model=list[Room],
    responses={
        500: {"description": "Erro ao listar salas"},
    },
)
async def list_all_rooms(skip: int = 0, request: Request = None):
    """
    Retorna todas as salas com paginação.
    Calcula o status isFree via aggregation pipeline: verifica se existe alguma reserva ativa no intervalo de tempo atual.
    Uma sala é FREE se NÃO houver nenhuma reserva onde start_date <= now <= end_date
    """
    limit = 10
    
    # Define o pipeline de agregação complexo
    pipeline = [
        # 🔹 Aplica paginação: pula N salas e limita o resultado a 10
        {"$skip": skip},
        {"$limit": limit},
        
        # 🔹 LEFT JOIN com a coleção user_sala para buscar reservas ativas
        {
            "$lookup": {
                "from": "user_sala",  # Coleção a fazer join
                "let": {"room_id": "$_id"},  # Exporta o ID da sala para usar no pipeline interno
                "pipeline": [
                    {
                        # Filtra apenas reservas onde o momento atual (now) está entre start_date e end_date
                        "$match": {
                            "$expr": {
                                "$and": [
                                    # A reserva pertence a esta sala
                                    {"$eq": ["$room_id", "$$room_id"]},
                                    # Agora é DEPOIS ou IGUAL ao início da reserva
                                    {"$lte": ["$start_date", request.state.now]},
                                    # Agora é ANTES ou IGUAL ao fim da reserva
                                    {"$gte": ["$end_date", request.state.now]}
                                ]
                            }
                        }
                    }
                ],
                "as": "active_reservations"  # Resultado armazenado neste array
            }
        },
        
        # 🔹 Adiciona novos campos calculados
        {
            "$addFields": {
                # isFree = true se NÃO houver reservas ativas (array vazio tem tamanho 0)
                # isFree = false se houver pelo menos 1 reserva ativa
                "isFree": {"$eq": [{"$size": "$active_reservations"}, 0]},
                # Converte o _id para string para retornar como "id"
                "id": {"$toString": "$_id"}
            }
        },
        
        # 🔹 Remove campos desnecessários do resultado final
        {
            "$project": {
                "_id": 0,  # Remove o _id original
                "active_reservations": 0  # Remove o array de reservas (não queremos retornar)
            }
        }
    ]
    
    # Executa a agregação e retorna todas as salas processadas
    cursor = database.sala_collection.aggregate(pipeline)
    rooms = await cursor.to_list(None)
    return rooms


# 🔹 Obter uma sala específica
@roomRouter.get(
    "/{room_id}",
    summary="Obter uma sala por ID",
    response_model=list[Room],
    responses={
        400: {"description": "ID de sala inválido"},
        404: {"description": "Sala não encontrada"},
    },
)
async def get_room(room_id: str):
    """
    Retorna uma sala específica pelo ID
    """
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID de sala inválido")

    sala = await database.sala_collection.find_one({"_id": ObjectId(room_id)})
    if not sala:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    sala["id"] = str(sala["_id"])
    del sala["_id"]
    return [sala]


# 🔹 Atualizar
@roomRouter.put(
    "/{room_id}",
    summary="Atualizar uma sala",
    response_model=RoomMessage,
    responses={
        400: {"description": "ID de sala inválido ou dados de atualização inválidos"},
        404: {"description": "Sala não encontrada"},
    },
)
async def update_room(room_id: str, room: RoomUpdate, request: Request):
    """
    Atualiza os detalhes de uma sala existente com base no ID fornecido e nos dados de atualização de RoomUpdate
    """

    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    update_data = room.model_dump()
    update_data["updated_at"] = request.state.now

    result = await database.sala_collection.update_one(
        {"_id": ObjectId(room_id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return RoomMessage(message="Sala atualizada com sucesso")


# 🔹 Deletar
@roomRouter.delete(
    "/{room_id}",
    summary="Deletar uma sala",
    response_model=RoomMessage,
    responses={
        400: {"description": "ID de sala inválido"},
        404: {"description": "Sala não encontrada"},
    },
)
async def delete_room(room_id: str):
    """
    Deleta uma sala específica com base no ID fornecido
    """
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    result = await database.sala_collection.delete_one({"_id": ObjectId(room_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return RoomMessage(message="Sala removida com sucesso")
