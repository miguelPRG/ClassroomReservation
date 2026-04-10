from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from models.roomModel import RoomCreate, RoomGet, RoomUpdate, RoomMessage
from database import sala_collection

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
    Cria uma nova sala com os detalhes fornecidos de RoomCreate
    """
    room_dict = room.model_dump()
    room_dict["created_at"] = datetime.now()
    room_dict["updated_at"] = datetime.now()

    try:
        result = await sala_collection.insert_one(room_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar sala: {str(e)}")

    return {"message": "Sala criada com sucesso", "id": str(result.inserted_id)}


# 🔹 Listar salas
@roomRouter.get(
    "/{room_id}",
    summary="Listar salas",
    response_model=list[RoomGet],
    responses={
        400: {"description": "ID de sala inválido"},
        404: {"description": "Sala não encontrada"},
    },

)
async def list_rooms(room_id: str = None, skip: int = 0):
    """
    Sacamos todas as salas ou uma sala especifica se o ID for fornecido. Se room_id for None, retorna todas as salas. Caso contrário, retorna a sala correspondente ao ID.
    """

    limit = 10

    rooms = []

    if not room_id:
        cursor = sala_collection.find().limit(limit).skip(skip)
        async for room in cursor:
            room["id"] = str(room["_id"])
            del room["_id"]
            rooms.append(room)
        return rooms

    else:
        
        if not ObjectId.is_valid(room_id):
            raise HTTPException(status_code=400, detail="ID de sala inválido")

        sala = await sala_collection.find_one({"_id": ObjectId(room_id)})
        if not sala:
            raise HTTPException(status_code=404, detail="Sala não encontrada")

        sala["id"] = str(sala["_id"])
        del sala["_id"]
        rooms.append(sala)
    
    return rooms


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

    result = await sala_collection.update_one(
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

    result = await sala_collection.delete_one({"_id": ObjectId(room_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return {"message": "Sala removida com sucesso"}
