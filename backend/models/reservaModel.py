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
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        valid_statuses = {"livre", "ocupado"}
        if value not in valid_statuses:
            raise ValueError(
                f"Status inválido. Deve ser um dos seguintes: {', '.join(valid_statuses)}"
            )
        return value
