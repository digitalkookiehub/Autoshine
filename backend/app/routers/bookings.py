import logging
from datetime import datetime, timezone, timedelta, date as date_type, time as time_type
from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user, get_current_staff_or_admin
from app.models.booking import Booking, BookingStatus, TimeSlot, BookingStatusHistory, BookingPhoto
from app.models.service import Service, ServiceAddon
from app.schemas.booking import (
    CreateBookingRequest, BookingResponse, TimeSlotResponse,
    UpdateBookingStatusRequest, GenerateSlotsRequest, CancelBookingRequest,
    BookingPhotoResponse,
)
from app.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.utils.push_notifications import send_push_to_user
from app.utils.cloudinary_upload import upload_image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["bookings"])
slots_router = APIRouter(prefix="/slots", tags=["slots"])


@slots_router.get("", response_model=List[TimeSlotResponse])
def get_available_slots(
    booking_date: date_type = Query(..., alias="date"),
    service_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    slots = (
        db.query(TimeSlot)
        .filter(TimeSlot.date == booking_date, TimeSlot.is_blocked == False)
        .order_by(TimeSlot.start_time)
        .all()
    )
    for slot in slots:
        slot.is_available = slot.booked_count < slot.capacity
    return slots


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    req: CreateBookingRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    slot = db.query(TimeSlot).filter(TimeSlot.id == req.slot_id, TimeSlot.is_blocked == False).first()
    if not slot:
        raise NotFoundError("Time slot")
    if slot.booked_count >= slot.capacity:
        raise ValidationError("This time slot is fully booked")

    service = db.query(Service).filter(Service.id == req.service_id, Service.is_active == True).first()
    if not service:
        raise NotFoundError("Service")

    total_price = float(service.price)
    discount = 0.0

    if req.addon_ids:
        addons = db.query(ServiceAddon).filter(
            ServiceAddon.id.in_(req.addon_ids),
            ServiceAddon.service_id == service.id,
            ServiceAddon.is_active == True,
        ).all()
        total_price += sum(float(a.price) for a in addons)

    if req.promo_code:
        from app.models.booking import PromoCode
        promo = db.query(PromoCode).filter(
            PromoCode.code == req.promo_code,
            PromoCode.is_active == True,
        ).first()
        if promo and (promo.max_uses is None or promo.uses_count < promo.max_uses):
            if promo.discount_type == "percent":
                discount = total_price * (float(promo.discount_value) / 100)
            else:
                discount = float(promo.discount_value)
            promo.uses_count += 1

    booking = Booking(
        user_id=current_user.id,
        service_id=req.service_id,
        vehicle_id=req.vehicle_id,
        slot_id=req.slot_id,
        addon_ids=req.addon_ids,
        pickup_required=req.pickup_required,
        pickup_address=req.pickup_address,
        notes=req.notes,
        total_price=round(total_price - discount, 2),
        discount_amount=round(discount, 2),
    )
    db.add(booking)
    slot.booked_count += 1

    db.flush()
    history = BookingStatusHistory(
        booking_id=booking.id,
        status=BookingStatus.pending,
        changed_by_id=current_user.id,
        timestamp=datetime.now(timezone.utc),
        note="Booking created",
    )
    db.add(history)
    db.commit()
    db.refresh(booking)

    send_push_to_user(db, current_user.id, "Booking Received", f"Your {service.name} booking is pending confirmation.")
    return booking


@router.get("", response_model=List[BookingResponse])
def list_my_bookings(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Booking).filter(Booking.user_id == current_user.id)
    if status:
        q = q.filter(Booking.status == status)
    return q.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking")
    if booking.user_id != current_user.id and current_user.role not in ["admin", "staff"]:
        raise ForbiddenError("Not your booking")
    return booking


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    req: CancelBookingRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking")
    if booking.user_id != current_user.id:
        raise ForbiddenError("Not your booking")
    if booking.status == BookingStatus.cancelled:
        raise ValidationError("Already cancelled")
    if booking.status == BookingStatus.completed:
        raise ValidationError("Cannot cancel completed booking")

    slot = db.query(TimeSlot).filter(TimeSlot.id == booking.slot_id).first()
    if slot:
        slot_dt = datetime.combine(slot.date, slot.start_time)
        slot_dt = slot_dt.replace(tzinfo=timezone.utc)
        if (slot_dt - datetime.now(timezone.utc)).total_seconds() < 86400:
            raise ValidationError("Cannot cancel within 24 hours of appointment")
        slot.booked_count = max(0, slot.booked_count - 1)

    booking.status = BookingStatus.cancelled
    booking.cancellation_reason = req.reason
    history = BookingStatusHistory(
        booking_id=booking.id,
        status=BookingStatus.cancelled,
        changed_by_id=current_user.id,
        timestamp=datetime.now(timezone.utc),
        note=req.reason,
    )
    db.add(history)
    db.commit()
    return {"message": "Booking cancelled"}


@router.post("/{booking_id}/photos", status_code=201)
async def upload_photo(
    booking_id: int,
    photo_type: str = Query(..., pattern="^(before|after)$"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking")

    contents = await file.read()
    url = upload_image(contents, folder=f"autoshine/bookings/{booking_id}")
    if not url:
        raise ValidationError("Failed to upload image")

    photo = BookingPhoto(
        booking_id=booking_id,
        photo_url=url,
        type=photo_type,
        uploaded_by_id=current_user.id,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {"photo_url": url, "type": photo_type}


@router.get("/{booking_id}/photos", response_model=List[BookingPhotoResponse])
def get_photos(booking_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(BookingPhoto).filter(BookingPhoto.booking_id == booking_id).all()
