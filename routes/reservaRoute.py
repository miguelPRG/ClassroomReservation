from fastapi import APIRouter, HTTPException, Request
from pymongo.errors import DuplicateKeyError
from models.reservaModel import ReservationCreate
import database
from bson import ObjectId
from datetime import datetime
from asyncio import gather

reservaRouter = APIRouter(prefix="/reservation", tags=["Reservation"])

@reservaRouter.post(
    "/create",
    summary="Criar uma nova reserva",
    responses={
        404: {"description": "Utilizador ou Sala não encontrado"},
        409: {"description": "Já existe uma reserva para esta sala neste intervalo de tempo"}
    },
)
async def create_reservation(
    reservation: ReservationCreate,
    request: Request
):
    """
    Cria uma nova reserva. Verifica se o utilizador e a sala existem, e se não houver conflitos de reservas para a mesma sala no mesmo intervalo de tempo, insere a nova reserva na base de dados com as datas de criação e atualização.
    """
    reservation.user_id = ObjectId(reservation.user_id)
    reservation.room_id = ObjectId(reservation.room_id)

    # Sacar o jwt
    jwt_token = request.state.user

    # Este é o user_id do user que está a consumir esta API
    user_id = ObjectId(jwt_token["user_id"])
    
    # Verificar se o user existe
    user = database.user_collection.find_one({"_id": reservation.user_id})

    # Verificar se o room existe
    room = database.sala_collection.find_one({"_id": reservation.room_id})

    # Verificar se já existe uma reserva para esta sala, onde a data de start interfira com o intervalo entre o satrt e o end(inclusivo) da reserva enontrada
    user_sala = database.user_sala_collection.find_one({
        "room_id": reservation.room_id,
        "start": {"$lte": reservation.end},
        "end": {"$gte": reservation.start}
    })

    # Isto permite executar as tres consultas em paralelo, o que pode melhorar a performance.
    user, room, user_sala = await gather(user, room, user_sala)  # Simula uma operação assíncrona

    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")

    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada")
    
    if user_sala:
        raise HTTPException(status_code=409, detail="Já existe uma reserva para esta sala neste intervalo de tempo")

    data = datetime.now()

    reservation_dict = reservation.model_dump()
    reservation_dict["created_by"] = user_id
    reservation_dict["created_at"] = data
    reservation_dict["updated_by"] = user_id
    reservation_dict["updated_at"] = data

    try:
        await database.user_sala_collection.insert_one(reservation_dict)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Já existe uma reserva para este utilizador nesta sala"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating reservation: {str(e)}")

    return {
        "start": reservation.start,
        "end": reservation.end,
        "created_at": data,
        "updated_at": data,
    }
