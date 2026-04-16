from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from models.roomModel import RoomCreate, RoomGet, RoomUpdate, RoomMessage
import database
roomRouter = APIRouter(prefix="/room", tags=["Rooms"])


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
async def create_room(room: RoomCreate):
    """
    Cria uma nova sala com oPartial<CreateRoomPayload>) =>s detalhes fornecidos de RoomCreate
    """
    room_dict = room.model_dump()
    room_dict["isFree"] = True
    room_dict["created_at"] = datetime.now()
    room_dict["updated_at"] = datetime.now()

    try:
        result = await database.sala_collection.insert_one(room_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar sala: {str(e)}")

    return {"message": "Sala criada com sucesso", "id": str(result.inserted_id)}

# 🔹 Listar todas as salas
@roomRouter.get(
    "/",
    summary="Listar todas as salas",
    response_model=list[RoomGet],
    responses={
        500: {"description": "Erro ao listar salas"},
    },
)
async def list_all_rooms(skip: int = 0):
    """
    Retorna todas as salas com paginação
    """
    limit = 10
    cursor = database.sala_collection.find().limit(limit).skip(skip)
    rooms = []
    async for room in cursor:
        room["id"] = str(room["_id"])
        del room["_id"]
        rooms.append(room)
    return rooms


# 🔹 Obter uma sala específica
@roomRouter.get(
    "/{room_id}",
    summary="Obter uma sala por ID",
    response_model=list[RoomGet],
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
async def update_room(room_id: str, room: RoomUpdate):
    """
        Atualiza os detalhes de uma sala existente com base no ID fornecido e nos dados de atualização de RoomUpdate
    """
    
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    update_data = room.model_dump()
    update_data["updated_at"] = datetime.now()

    result = await database.sala_collection.update_one(
        {"_id": ObjectId(room_id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return {"message": "Sala atualizada com sucesso"}


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

    return {"message": "Sala removida com sucesso"}
