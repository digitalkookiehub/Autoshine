from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateVehicleRequest(BaseModel):
    make: str
    model: str
    year: Optional[int] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None


class UpdateVehicleRequest(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None


class VehicleResponse(BaseModel):
    id: int
    user_id: int
    make: str
    model: str
    year: Optional[int]
    color: Optional[str]
    license_plate: Optional[str]
    image_url: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
