from fastapi import APIRouter, HTTPException, Request
from models.reservaModel import ReservationCreate, ReservationMessage, Reservation
import database
from bson import ObjectId

reservaRouter = APIRouter(prefix="/reservation", tags=["Reservation"])


@reservaRouter.post(
    "/",
    summary="Criar uma nova reserva",
    responses={
        404: {"description": "Utilizador ou Sala não encontrado"},
        409: {
            "description": "Já existe uma reserva para esta sala neste intervalo de tempo"
        },
    },
    response_model=ReservationMessage,
)
async def create_reservation(reservation: ReservationCreate, request: Request):
    """
    Cria uma nova reserva. Verifica se o utilizador e a sala existem, e se não houver conflitos de reservas para a mesma sala no mesmo intervalo de tempo, insere a nova reserva na base de dados com as datas de criação e atualização.
    """
    reservation.room_id = ObjectId(reservation.room_id)
    jwt_token = request.state.user
    user_id = ObjectId(jwt_token["user_id"])

    # Verificar se a sala existe
    room_exists = await database.sala_collection.find_one({"_id": reservation.room_id})
    if not room_exists:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    # Verificar se existe alguma reserva conflitante
    conflict = await database.user_sala_collection.find_one(
        {
            "room_id": reservation.room_id,
            "start_datetime": {"$lte": reservation.end_datetime},
            "end_datetime": {"$gte": reservation.start_datetime},
        }
    )
    if conflict:
        raise HTTPException(status_code=409, detail="Conflito de reserva. Já existe uma reserva para esta sala neste intervalo de tempo")

    reservation_dict = reservation.model_dump()
    reservation_dict["created_by"] = user_id
    reservation_dict["created_at"] = request.state.now
    reservation_dict["estado"] = "ativa"

    try:
        await database.user_sala_collection.insert_one(reservation_dict)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating reservation: {str(e)}"
        )

    return ReservationMessage(message="Reserva criada com sucesso")


@reservaRouter.get(
    "/room/{room_id}",
    summary="Obter todas as reservas de uma sala",
    responses={
        400: {"description": "ID de sala inválido"},
        404: {"description": "Sala não encontrada"},
    },
    response_model=list[Reservation],
)
async def get_reservations_by_room(room_id: str, request: Request, page: int = 0, page_size: int = 5):
    """
    Retorna todas as reservas de uma sala específica de forma paginada. Verifica se o ID da sala é válido e retorna as reservas ou um erro apropriado.
    """
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="ID de sala inválido")

    if page < 0:
        page = 0
    
    # Limitar page_size entre 1 e 100 para evitar abusos
    if page_size < 1 or page_size > 100:
        page_size = 5

    skip = page * page_size
    reservations = await database.user_sala_collection.find(
        {"room_id": ObjectId(room_id)}
    ).skip(skip).limit(page_size).to_list(None)

    result = []
    for reservation in reservations:
        # Procurar o user que o id é igual a reservation.get("created_by", "") e obter o nome do user
        nome = "Desconecido"
        creator_email = "Desconhecido"
        user_found = await database.user_collection.find_one(
            {"_id": ObjectId(reservation.get("created_by", ""))}
        )

        if user_found:
            nome = user_found.get("nome", "Desconecido")
            creator_email = user_found.get("email", "Desconhecido")

        estado = reservation.get("estado", "desconecido")

        # Vamos verificar se o estado está ativo e se o intervalos de tempo da reserva é válido
        if reservation.get("estado", "") == "ativa" and reservation.get("end_datetime") < request.state.now:
            # Se a reserva já passou, vamos atualizar o estado para "expirada"
            await database.user_sala_collection.update_one(
                {"_id": reservation["_id"]}, {"$set": {"estado": "expirada"}}
            )
            estado = "expirada"

        reservation_data = {
            "id": str(reservation["_id"]),
            "room_id": str(reservation.get("room_id", "")),
            "start_datetime": reservation.get("start_datetime"),
            "end_datetime": reservation.get("end_datetime"),
            "created_by": nome,
            "creator_email": creator_email,
            "estado": estado,
        }
        result.append(Reservation(**reservation_data))

    return result


@reservaRouter.delete(
    "/{reservation_id}",
    summary="Deletar uma reserva",
    responses={
        400: {"description": "ID de reserva inválido"},
        404: {"description": "Reserva não encontrada"},
    },
    response_model=ReservationMessage,
)
async def delete_reservation(reservation_id: str):
    """Apaga uma reserva específica pelo ID. Verifica se o ID da reserva é válido e retorna uma mensagem de sucesso ou um erro apropriado."""
    if not ObjectId.is_valid(reservation_id):
        raise HTTPException(status_code=400, detail="ID de reserva inválido")

    result = await database.user_sala_collection.delete_one(
        {"_id": ObjectId(reservation_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    return ReservationMessage(message="Reserva deletada com sucesso")
