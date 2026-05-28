from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ServiceCategoryResponse(BaseModel):
    id: int
    name: str
    icon_name: Optional[str]
    display_order: int
    is_active: bool

    class Config:
        from_attributes = True


class ServiceAddonResponse(BaseModel):
    id: int
    service_id: int
    name: str
    price: float
    is_active: bool

    class Config:
        from_attributes = True


class ServiceResponse(BaseModel):
    id: int
    category_id: Optional[int]
    name: str
    tagline: Optional[str]
    description: Optional[str]
    price: float
    duration_minutes: int
    image_url: Optional[str]
    benefits: Optional[List[str]]
    rating_avg: float
    review_count: int
    is_featured: bool
    is_active: bool
    display_order: int
    category: Optional[ServiceCategoryResponse]
    addons: List[ServiceAddonResponse] = []

    class Config:
        from_attributes = True


class CreateServiceRequest(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    price: float
    duration_minutes: int = 60
    image_url: Optional[str] = None
    benefits: Optional[List[str]] = None
    category_id: Optional[int] = None
    is_featured: bool = False
    display_order: int = 0


class UpdateServiceRequest(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    benefits: Optional[List[str]] = None
    category_id: Optional[int] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CreateCategoryRequest(BaseModel):
    name: str
    icon_name: Optional[str] = None
    display_order: int = 0


class CreateAddonRequest(BaseModel):
    name: str
    price: float
