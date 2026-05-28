from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CreateReviewRequest(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    photos: Optional[List[str]] = None


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    user_id: int
    service_id: int
    rating: int
    comment: Optional[str]
    photos: Optional[List[str]]
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True
