from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class RoomCreate(BaseModel):
    name: str
    location: str
    capacity: int
    capacity_exam: int
    active: bool
    characteristic_name: str
    building_identifier: int

    created_by: str = Field(..., pattern="^[0-9a-fA-F]{24}$")
    updated_by: str = Field(..., pattern="^[0-9a-fA-F]{24}$")


class Room(RoomCreate):
    id: str
    created_at: datetime
    updated_at: datetime