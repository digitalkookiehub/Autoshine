from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.membership import MembershipPlan, UserMembership, LoyaltyTransaction
from app.schemas.membership import (
    MembershipPlanResponse, UserMembershipResponse,
    LoyaltyResponse, LoyaltyTransactionResponse, SubscribePlanRequest,
)
from app.exceptions import NotFoundError, ConflictError

router = APIRouter(prefix="/memberships", tags=["memberships"])


@router.get("/plans", response_model=List[MembershipPlanResponse])
def list_plans(db: Session = Depends(get_db)):
    return db.query(MembershipPlan).filter(MembershipPlan.is_active == True).all()


@router.get("/my", response_model=UserMembershipResponse)
def my_membership(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    membership = db.query(UserMembership).filter(UserMembership.user_id == current_user.id).first()
    if not membership:
        raise NotFoundError("Membership")
    return membership


@router.post("/subscribe", response_model=UserMembershipResponse, status_code=201)
def subscribe(
    req: SubscribePlanRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing = db.query(UserMembership).filter(
        UserMembership.user_id == current_user.id,
        UserMembership.status == "active",
    ).first()
    if existing:
        raise ConflictError("Already subscribed to a plan")

    plan = db.query(MembershipPlan).filter(MembershipPlan.id == req.plan_id, MembershipPlan.is_active == True).first()
    if not plan:
        raise NotFoundError("Plan")

    membership = UserMembership(
        user_id=current_user.id,
        plan_id=plan.id,
        status="active",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30 if req.billing == "monthly" else 365),
    )
    db.add(membership)
    current_user.membership_tier = plan.name
    db.commit()
    db.refresh(membership)
    return membership


@router.put("/cancel")
def cancel_membership(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    membership = db.query(UserMembership).filter(
        UserMembership.user_id == current_user.id,
        UserMembership.status == "active",
    ).first()
    if not membership:
        raise NotFoundError("Active membership")
    membership.status = "cancelled"
    current_user.membership_tier = "none"
    db.commit()
    return {"message": "Membership cancelled"}


loyalty_router = APIRouter(prefix="/loyalty", tags=["loyalty"])


@loyalty_router.get("", response_model=LoyaltyResponse)
def get_loyalty(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    transactions = (
        db.query(LoyaltyTransaction)
        .filter(LoyaltyTransaction.user_id == current_user.id)
        .order_by(LoyaltyTransaction.created_at.desc())
        .limit(50)
        .all()
    )
    return LoyaltyResponse(
        total_points=current_user.loyalty_points,
        transactions=[LoyaltyTransactionResponse.model_validate(t) for t in transactions],
    )
