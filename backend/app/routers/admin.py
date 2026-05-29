import logging
from datetime import datetime, timezone, date as date_type, time as time_type, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_staff_or_admin, get_current_admin
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingStatus, BookingStatusHistory, TimeSlot
from app.models.membership import LoyaltyTransaction
from app.models.service import Service
from app.schemas.booking import UpdateBookingStatusRequest, BookingResponse, GenerateSlotsRequest
from app.schemas.auth import UserResponse
from app.schemas.admin import DashboardStatsResponse, CreateStaffRequest
from app.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardStatsResponse)
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_staff_or_admin)):
    today = date_type.today()
    first_of_month = today.replace(day=1)

    today_bookings = db.query(func.count(Booking.id)).filter(
        func.date(Booking.created_at) == today,
        Booking.status != BookingStatus.cancelled,
    ).scalar() or 0

    today_revenue = db.query(func.sum(Booking.total_price)).filter(
        func.date(Booking.created_at) == today,
        Booking.status == BookingStatus.completed,
    ).scalar() or 0

    pending = db.query(func.count(Booking.id)).filter(
        Booking.status == BookingStatus.pending
    ).scalar() or 0

    total_customers = db.query(func.count(User.id)).filter(
        User.role == UserRole.customer
    ).scalar() or 0

    month_revenue = db.query(func.sum(Booking.total_price)).filter(
        Booking.created_at >= first_of_month,
        Booking.status == BookingStatus.completed,
    ).scalar() or 0

    month_bookings = db.query(func.count(Booking.id)).filter(
        Booking.created_at >= first_of_month,
        Booking.status != BookingStatus.cancelled,
    ).scalar() or 0

    return DashboardStatsResponse(
        today_bookings=today_bookings,
        today_revenue=float(today_revenue),
        pending_bookings=pending,
        total_customers=total_customers,
        this_month_revenue=float(month_revenue),
        this_month_bookings=month_bookings,
    )


@router.get("/bookings/today", response_model=List[BookingResponse])
def today_bookings(db: Session = Depends(get_db), _=Depends(get_current_staff_or_admin)):
    today = date_type.today()
    slots_today = db.query(TimeSlot.id).filter(TimeSlot.date == today).subquery()
    return (
        db.query(Booking)
        .filter(Booking.slot_id.in_(slots_today))
        .order_by(Booking.created_at)
        .all()
    )


@router.get("/bookings", response_model=List[BookingResponse])
def all_bookings(
    status: Optional[str] = None,
    booking_date: Optional[date_type] = Query(None, alias="date"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(get_current_staff_or_admin),
):
    q = db.query(Booking)
    if status:
        q = q.filter(Booking.status == status)
    if booking_date:
        slots_on_date = db.query(TimeSlot.id).filter(TimeSlot.date == booking_date).subquery()
        q = q.filter(Booking.slot_id.in_(slots_on_date))
    return q.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    req: UpdateBookingStatusRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_staff_or_admin),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking")

    valid_transitions = {
        "pending": ["confirmed", "cancelled"],
        "confirmed": ["in_progress", "cancelled"],
        "in_progress": ["completed", "cancelled"],
    }
    if booking.status in valid_transitions and req.status not in valid_transitions.get(booking.status, []):
        raise ValidationError(f"Cannot transition from {booking.status} to {req.status}")

    booking.status = req.status

    if req.status == "completed":
        POINTS_PER_BOOKING = 50
        user = db.query(User).filter(User.id == booking.user_id).first()
        if user:
            user.loyalty_points = (user.loyalty_points or 0) + POINTS_PER_BOOKING
            tx = LoyaltyTransaction(
                user_id=user.id,
                points=POINTS_PER_BOOKING,
                type="earned",
                description="Booking completed",
                booking_id=booking.id,
            )
            db.add(tx)

    history = BookingStatusHistory(
        booking_id=booking.id,
        status=req.status,
        changed_by_id=current_user.id,
        timestamp=datetime.now(timezone.utc),
        note=req.note,
    )
    db.add(history)
    db.commit()

    from app.utils.push_notifications import send_push_to_user
    status_msgs = {
        "confirmed": "Your booking has been confirmed!",
        "in_progress": "Your car detailing has started.",
        "completed": "Your car is ready! Please leave a review.",
        "cancelled": "Your booking has been cancelled.",
    }
    msg = status_msgs.get(req.status)
    if msg:
        send_push_to_user(db, booking.user_id, "Booking Update", msg)

    return {"message": "Status updated", "status": req.status}


@router.get("/customers", response_model=List[UserResponse])
def list_customers(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(get_current_staff_or_admin),
):
    q = db.query(User).filter(User.role == UserRole.customer)
    if search:
        q = q.filter(
            User.full_name.ilike(f"%{search}%") | User.phone_number.ilike(f"%{search}%")
        )
    return q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/customers/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db), _=Depends(get_current_staff_or_admin)):
    user = db.query(User).filter(User.id == customer_id).first()
    if not user:
        raise NotFoundError("Customer")
    booking_count = db.query(func.count(Booking.id)).filter(Booking.user_id == customer_id).scalar() or 0
    total_spent = db.query(func.sum(Booking.total_price)).filter(
        Booking.user_id == customer_id, Booking.status == BookingStatus.completed
    ).scalar() or 0
    return {
        "user": UserResponse.model_validate(user),
        "booking_count": booking_count,
        "total_spent": float(total_spent),
    }


@router.get("/customers/{customer_id}/bookings", response_model=List[BookingResponse])
def customer_bookings(customer_id: int, db: Session = Depends(get_db), _=Depends(get_current_staff_or_admin)):
    return db.query(Booking).filter(Booking.user_id == customer_id).order_by(Booking.created_at.desc()).all()


@router.post("/slots/generate")
def generate_slots(
    req: GenerateSlotsRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    from datetime import datetime as dt
    slots_created = 0
    current = req.start_date
    while current <= req.end_date:
        start_h, start_m = map(int, req.start_time.split(":"))
        end_h, end_m = map(int, req.end_time.split(":"))
        slot_start = time_type(start_h, start_m)
        day_end = time_type(end_h, end_m)
        while True:
            slot_end_mins = slot_start.hour * 60 + slot_start.minute + req.slot_duration_minutes
            if slot_end_mins > day_end.hour * 60 + day_end.minute:
                break
            slot_end = time_type(slot_end_mins // 60, slot_end_mins % 60)
            existing = db.query(TimeSlot).filter(
                TimeSlot.date == current, TimeSlot.start_time == slot_start
            ).first()
            if not existing:
                db.add(TimeSlot(date=current, start_time=slot_start, end_time=slot_end, capacity=req.capacity))
                slots_created += 1
            next_mins = slot_start.hour * 60 + slot_start.minute + req.slot_duration_minutes
            slot_start = time_type(next_mins // 60, next_mins % 60)
        current += timedelta(days=1)
    db.commit()
    return {"slots_created": slots_created}


@router.get("/analytics")
def analytics(
    range: str = Query("7d", pattern="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    _=Depends(get_current_staff_or_admin),
):
    days = {"7d": 7, "30d": 30, "90d": 90}[range]
    since = datetime.now(timezone.utc) - timedelta(days=days)
    bookings = db.query(Booking).filter(Booking.created_at >= since).all()
    revenue = sum(float(b.total_price) for b in bookings if b.status == BookingStatus.completed)
    return {
        "total_bookings": len(bookings),
        "total_revenue": revenue,
        "completed": sum(1 for b in bookings if b.status == BookingStatus.completed),
        "cancelled": sum(1 for b in bookings if b.status == BookingStatus.cancelled),
        "range": range,
    }


@router.get("/offers")
def list_offers(db: Session = Depends(get_db), _=Depends(get_current_staff_or_admin)):
    from app.models.booking import PromoCode
    return [
        {
            "id": p.id,
            "code": p.code,
            "discount_type": p.discount_type,
            "discount_value": float(p.discount_value),
            "max_uses": p.max_uses,
            "uses_count": p.uses_count,
            "expires_at": p.expires_at,
            "is_active": p.is_active,
        }
        for p in db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()
    ]


@router.post("/offers", status_code=201)
def create_offer(req: dict, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    from app.models.booking import PromoCode
    from pydantic import BaseModel
    from typing import Optional as Opt
    from datetime import datetime as dt

    existing = db.query(PromoCode).filter(PromoCode.code == req.get("code", "").upper()).first()
    if existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail="Promo code already exists")

    expires_at = None
    if req.get("expires_at"):
        expires_at = dt.fromisoformat(req["expires_at"].replace("Z", "+00:00"))

    promo = PromoCode(
        code=req["code"].upper().strip(),
        discount_type=req["discount_type"],
        discount_value=req["discount_value"],
        max_uses=req.get("max_uses"),
        expires_at=expires_at,
        is_active=True,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return {
        "id": promo.id,
        "code": promo.code,
        "discount_type": promo.discount_type,
        "discount_value": float(promo.discount_value),
        "max_uses": promo.max_uses,
        "uses_count": promo.uses_count,
        "expires_at": promo.expires_at,
        "is_active": promo.is_active,
    }


@router.patch("/offers/{offer_id}/toggle")
def toggle_offer(offer_id: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    from app.models.booking import PromoCode
    promo = db.query(PromoCode).filter(PromoCode.id == offer_id).first()
    if not promo:
        from app.exceptions import NotFoundError
        raise NotFoundError("Offer")
    promo.is_active = not promo.is_active
    db.commit()
    return {"id": promo.id, "is_active": promo.is_active}


@router.delete("/offers/{offer_id}", status_code=204)
def delete_offer(offer_id: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    from app.models.booking import PromoCode
    promo = db.query(PromoCode).filter(PromoCode.id == offer_id).first()
    if not promo:
        from app.exceptions import NotFoundError
        raise NotFoundError("Offer")
    db.delete(promo)
    db.commit()


@router.get("/staff", response_model=List[UserResponse])
def list_staff(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return db.query(User).filter(User.role == UserRole.staff).all()


@router.post("/staff", response_model=UserResponse, status_code=201)
def create_staff(req: CreateStaffRequest, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    import secrets
    user = User(
        phone_number=req.phone_number,
        full_name=req.full_name,
        role=UserRole.staff,
        referral_code=secrets.token_hex(6).upper(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
