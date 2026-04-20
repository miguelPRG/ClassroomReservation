from fastapi import APIRouter, HTTPException, Request
from models.reservaModel import ReservationCreate, ReservationMessage, Reservation
from database import user_sala_collection
from bson import ObjectId

reservaRouter = APIRouter(prefix="/reservation", tags=["Reservation"])


@reservaRouter.post(
    "/create",
    summary="Criar uma nova reserva",
    responses={
        404: {"description": "Utilizador ou Sala não encontrado"},
        409: {
            "description": "Já existe uma reserva para esta sala neste intervalo de tempo"
        },
    },
    response_model=ReservationMessage
)
async def create_reservation(reservation: ReservationCreate, request: Request):
    """
    Cria uma nova reserva. Verifica se o utilizador e a sala existem, e se não houver conflitos de reservas para a mesma sala no mesmo intervalo de tempo, insere a nova reserva na base de dados com as datas de criação e atualização.
    """
    reservation.user_id = ObjectId(reservation.user_id)
    reservation.room_id = ObjectId(reservation.room_id)
    jwt_token = request.state.user
    user_id = ObjectId(jwt_token["user_id"])

    # Uma única agregação para verificar user, room e conflitos
    result = await user_sala_collection.aggregate([
        {
            #operador $facet para realizar múltiplas verificações em paralelo
            "$facet": {
                "user_check": [
                    # $lookup para verificar se o utilizador existe
                    {"$lookup": {
                        # Da coleção "user"
                        "from": "user",
                        # Variável para o ID do utilizador
                        "let": {"userId": reservation.user_id},
                        # Pipeline para verificar se o ID do utilizador corresponde a um documento na coleção
                        # $match para comparar o ID do utilizador com o ID fornecido
                        # $expr para usar expressões de comparação
                        # $eq para verificar se os IDs são iguais
                        # $_id para acessar o ID do documento na coleção e $$userId para acessar a variável definida. Aqui tem dois sinais de dólar porque é necessário escapar o símbolo de dólar para usar a variável no pipeline.
                        "pipeline": [{"$match": {"$expr": {"$eq": ["$_id", "$$userId"]}}}],
                        "as": "user"
                    }},
                    {"$project": {"exists": {"$gt": [{"$size": "$user"}, 0]}}}
                ],
                # procurar a sala e verificar se existe
                "room_check": [
                    {"$lookup": {
                        "from": "sala",
                        "let": {"roomId": reservation.room_id},
                        "pipeline": [{"$match": {"$expr": {"$eq": ["$_id", "$$roomId"]}}}],
                        "as": "room"
                    }},
                    {"$project": {"exists": {"$gt": [{"$size": "$room"}, 0]}}}
                ],
                # verificar se existe alguma reserva conflitante para a mesma sala no mesmo intervalo de tempo
                "conflict_check": [
                    {"$match": {
                        "room_id": reservation.room_id,
                        "start": {"$lte": reservation.end},
                        "end": {"$gte": reservation.start},
                    }}
                ]
            }
        }
    ]).to_list(1)

    if not result[0]["user_check"][0]["exists"]:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    if not result[0]["room_check"][0]["exists"]:
        raise HTTPException(status_code=404, detail="Sala não encontrada")
    if result[0]["conflict_check"]:
        raise HTTPException(status_code=409, detail="Conflito de reserva")

    reservation_dict = reservation.model_dump()
    reservation_dict["created_by"] = user_id
    reservation_dict["created_at"] = request.state.now
    reservation_dict["updated_by"] = user_id
    reservation_dict["updated_at"] = request.state.now

    try:
        await user_sala_collection.insert_one(reservation_dict)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating reservation: {str(e)}"
        )

    return ReservationMessage(message="Reserva criada com sucesso")

@reservaRouter.get(
    "/{reservation_id}",
    summary="Obter detalhes de uma reserva",
    responses={
        404: {"description": "Reserva não encontrada"},
    },
    response_model=list[Reservation]
)
async def get_reservation(reservation_id: str = None):
    """
    Retorna os detalhes de uma reserva específica pelo ID. Verifica se o ID é válido e se a reserva existe, retornando os detalhes da reserva ou um erro apropriado.
    """
    if not ObjectId.is_valid(reservation_id):
        raise HTTPException(status_code=400, detail="ID de reserva inválido")

    reservation = await user_sala_collection.find_one({"_id": ObjectId(reservation_id)})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    reservation["id"] = str(reservation["_id"])
    del reservation["_id"]
    return Reservation(**reservation)

