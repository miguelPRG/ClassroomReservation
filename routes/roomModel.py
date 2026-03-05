from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from models.room import RoomCreate, Room
from database import room_collection

router = APIRouter(prefix="/rooms", tags=["Rooms"])


# 🔹 Criar sala
@router.post("/", response_model=Room)
async def create_room(room: RoomCreate):
    room_dict = room.model_dump()
    room_dict["created_at"] = datetime.utcnow()
    room_dict["updated_at"] = datetime.utcnow()

    result = await room_collection.insert_one(room_dict)

    room_dict["id"] = str(result.inserted_id)
    return room_dict


# 🔹 Listar salas
@router.get("/", response_model=List[Room])
async def list_rooms():
    rooms = []
    async for room in room_collection.find():
        room["id"] = str(room["_id"])
        del room["_id"]
        rooms.append(room)
    return rooms


# 🔹 Buscar por ID
@router.get("/{room_id}", response_model=Room)
async def get_room(room_id: str):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    room = await room_collection.find_one({"_id": ObjectId(room_id)})

    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    room["id"] = str(room["_id"])
    del room["_id"]
    return room


# 🔹 Atualizar
@router.put("/{room_id}", response_model=Room)
async def update_room(room_id: str, room: RoomCreate):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    update_data = room.model_dump()
    update_data["updated_at"] = datetime.utcnow()

    result = await room_collection.update_one(
        {"_id": ObjectId(room_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    updated_room = await room_collection.find_one({"_id": ObjectId(room_id)})
    updated_room["id"] = str(updated_room["_id"])
    del updated_room["_id"]

    return updated_room


# 🔹 Deletar
@router.delete("/{room_id}")
async def delete_room(room_id: str):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    result = await room_collection.delete_one({"_id": ObjectId(room_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return {"message": "Sala removida com sucesso"}