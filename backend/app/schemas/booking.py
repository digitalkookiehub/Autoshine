from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time


class TimeSlotResponse(BaseModel):
    id: int
    date: date
    start_time: time
    end_time: time
    capacity: int
    booked_count: int
    is_blocked: bool
    is_available: bool = False

    class Config:
        from_attributes = True


class CreateBookingRequest(BaseModel):
    service_id: int
    slot_id: int
    vehicle_id: Optional[int] = None
    addon_ids: List[int] = []
    pickup_required: bool = False
    pickup_address: Optional[str] = None
    notes: Optional[str] = None
    promo_code: Optional[str] = None


class BookingStatusHistoryResponse(BaseModel):
    id: int
    status: str
    note: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class BookingPhotoResponse(BaseModel):
    id: int
    photo_url: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


class BookingResponse(BaseModel):
    id: int
    user_id: int
    service_id: int
    vehicle_id: Optional[int]
    slot_id: int
    addon_ids: Optional[List[int]]
    status: str
    pickup_required: bool
    pickup_address: Optional[str]
    notes: Optional[str]
    total_price: float
    discount_amount: float
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class UpdateBookingStatusRequest(BaseModel):
    status: str
    note: Optional[str] = None


class GenerateSlotsRequest(BaseModel):
    start_date: date
    end_date: date
    start_time: str  # "09:00"
    end_time: str    # "18:00"
    slot_duration_minutes: int = 60
    capacity: int = 1


class CancelBookingRequest(BaseModel):
    reason: Optional[str] = None
