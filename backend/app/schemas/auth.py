from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SendOtpRequest(BaseModel):
    phone_number: str = Field(..., min_length=7, max_length=20)


class VerifyOtpRequest(BaseModel):
    phone_number: str
    code: str = Field(..., min_length=6, max_length=6)


class GoogleLoginRequest(BaseModel):
    id_token: str


class AppleLoginRequest(BaseModel):
    id_token: str
    full_name: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    expo_push_token: Optional[str] = None
    address: Optional[str] = None
    alternate_phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_new_user: bool = False
    user: Optional["UserResponse"] = None


class UserResponse(BaseModel):
    id: int
    phone_number: Optional[str]
    email: Optional[str]
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_active: bool
    loyalty_points: int
    referral_code: str
    membership_tier: str
    expo_push_token: Optional[str]
    address: Optional[str]
    alternate_phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
