from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DashboardStatsResponse(BaseModel):
    today_bookings: int
    today_revenue: float
    pending_bookings: int
    total_customers: int
    this_month_revenue: float
    this_month_bookings: int


class CreateStaffRequest(BaseModel):
    phone_number: str
    full_name: str


class StudioSettingsResponse(BaseModel):
    name: str
    phone: Optional[str]
    address: Optional[str]
    opening_time: Optional[str]
    closing_time: Optional[str]
    working_days: Optional[List[str]]

    class Config:
        from_attributes = True


class UpdateStudioSettingsRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    working_days: Optional[List[str]] = None
