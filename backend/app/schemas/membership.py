from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class MembershipPlanResponse(BaseModel):
    id: int
    name: str
    price_monthly: float
    price_yearly: float
    benefits: Optional[List[str]]
    free_washes_per_month: int
    discount_percent: int
    priority_booking: bool

    class Config:
        from_attributes = True


class UserMembershipResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: str
    start_date: date
    end_date: Optional[date]
    plan: MembershipPlanResponse

    class Config:
        from_attributes = True


class LoyaltyTransactionResponse(BaseModel):
    id: int
    points: int
    type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LoyaltyResponse(BaseModel):
    total_points: int
    transactions: List[LoyaltyTransactionResponse]


class SubscribePlanRequest(BaseModel):
    plan_id: int
    billing: str = "monthly"  # monthly or yearly
