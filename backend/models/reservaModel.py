from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class ReservationCreate(BaseModel):
    """
    Modelo para criação de uma reserva. Inclui validação do status da reserva.
    """
    user_id: str = Field(
        ..., pattern="^[0-9a-fA-F]{24}$", example="64b8c9f1e4b0a5d6c7e8f9a"
    )
    room_id: str = Field(
        ..., pattern="^[0-9a-fA-F]{24}$", example="64b8c9f1e4b0a5d6c7e8f9b"
    )
    start_datetime: datetime
    end_datetime: datetime

class Reservation(BaseModel):
    """
    Modelo para uma reserva completa, incluindo campos de auditoria.
    """
    id: str = Field(..., alias="_id")
    user_id: str
    room_id: str
    start_datetime: datetime
    end_datetime: datetime
    created_by: str
    created_at: datetime
    updated_by: str
    updated_at: datetime

class ReservationMessage(BaseModel):
    """
    Modelo para mensagens de resposta relacionadas a operações de reserva, como criação ou atualização.
    """
    message: str