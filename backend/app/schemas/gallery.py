from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class GalleryItemResponse(BaseModel):
    id: int
    service_id: Optional[int]
    before_url: str
    after_url: str
    video_url: Optional[str]
    caption: Optional[str]
    tags: Optional[List[str]]
    is_featured: bool
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreateGalleryItemRequest(BaseModel):
    service_id: Optional[int] = None
    before_url: str
    after_url: str
    video_url: Optional[str] = None
    caption: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: bool = False
