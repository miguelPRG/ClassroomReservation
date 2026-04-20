from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional


class RoomCreate(BaseModel):
    """
    Modelo para criação de uma sala de aula.
    """
    name: str = Field(..., max_length=255)
    location: str = Field(..., max_length=255)
    capacity: int = Field(..., le=150)
    capacity_exam: int = Field(..., le=30)
    characteristic_name: str = Field(..., max_length=150)
    building_identifier: str = Field(..., max_length=50)


class Room(BaseModel):
    """
    Modelo para representação de uma sala de aula, incluindo o ID e as datas de criação e atualização.
    """
    id: str
    name: str = Field(..., max_length=255)
    location: str = Field(..., max_length=255)
    capacity: int = Field(..., le=150)
    capacity_exam: int = Field(..., le=30)
    isFree: bool
    characteristic_name: str = Field(..., max_length=150)
    building_identifier: str = Field(..., max_length=50)
    created_at: datetime
    updated_at: datetime


class RoomUpdate(BaseModel):
    """
    Modelo para atualização de uma sala de aula. Todos os campos são opcionais, permitindo atualizações parciais.
    """
    name: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    capacity: Optional[int] = Field(None, le=150)
    capacity_exam: Optional[int] = Field(None, le=30)
    characteristic_name: Optional[str] = Field(None, max_length=150)
    building_identifier: Optional[str] = Field(None, max_length=50)


class RoomMessage(BaseModel):
    """
    Modelo para mensagens de resposta relacionadas a operações de sala, como criação ou atualização.
    """
    message: str
