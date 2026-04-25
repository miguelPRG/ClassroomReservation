from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime, timedelta, timezone


class ReservationCreate(BaseModel):
    """
    Modelo para criação de uma reserva. Inclui validação do status da reserva.
    """

    room_id: str = Field(
        ..., pattern="^[0-9a-fA-F]{24}$", example="64b8c9f1e4b0a5d6c7e8f9b"
    )
    start_datetime: datetime
    end_datetime: datetime

    @field_validator("start_datetime", "end_datetime")
    @classmethod
    def validate_datetime_not_past_or_too_far(cls, v):
        """Valida que as datas não estão no passado e não ultrapassam 6 meses no futuro"""
        now = datetime.now(timezone.utc)

        # Converter para UTC se tiver timezone, senão adicionar UTC
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)

        if v < now:
            raise ValueError("Data não pode ser no passado")

        max_date = now + timedelta(days=180)
        if v > max_date:
            raise ValueError("Data não pode ser superior a 6 meses no futuro")

        return v

    @model_validator(mode="after")
    def validate_datetime_range(self):
        """Valida que end_datetime é posterior a start_datetime"""
        if self.end_datetime <= self.start_datetime:
            raise ValueError("end_datetime deve ser posterior a start_datetime")
        return self


class Reservation(BaseModel):
    """
    Modelo para uma reserva completa, incluindo campos de auditoria.
    """

    id: str = Field(..., alias="_id")
    room_id: str
    start_datetime: datetime
    end_datetime: datetime
    created_by: str
    creator_email: str


class ReservationMessage(BaseModel):
    """
    Modelo para mensagens de resposta relacionadas a operações de reserva, como criação ou atualização.
    """

    message: str
