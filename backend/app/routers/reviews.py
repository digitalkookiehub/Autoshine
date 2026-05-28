from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models.review import Review
from app.models.booking import Booking, BookingStatus
from app.models.service import Service
from app.schemas.review import CreateReviewRequest, ReviewResponse
from app.exceptions import NotFoundError, ValidationError, ConflictError

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=201)
def create_review(
    req: CreateReviewRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = db.query(Booking).filter(
        Booking.id == req.booking_id,
        Booking.user_id == current_user.id,
    ).first()
    if not booking:
        raise NotFoundError("Booking")
    if booking.status != BookingStatus.completed:
        raise ValidationError("Can only review completed bookings")

    existing = db.query(Review).filter(Review.booking_id == req.booking_id).first()
    if existing:
        raise ConflictError("Review already submitted for this booking")

    review = Review(
        booking_id=req.booking_id,
        user_id=current_user.id,
        service_id=booking.service_id,
        rating=req.rating,
        comment=req.comment,
        photos=req.photos,
    )
    db.add(review)
    db.flush()

    avg = db.query(func.avg(Review.rating)).filter(
        Review.service_id == booking.service_id,
        Review.is_published == True,
    ).scalar() or 0
    count = db.query(func.count(Review.id)).filter(
        Review.service_id == booking.service_id,
        Review.is_published == True,
    ).scalar() or 0

    service = db.query(Service).filter(Service.id == booking.service_id).first()
    if service:
        service.rating_avg = round(float(avg), 2)
        service.review_count = count

    db.commit()
    db.refresh(review)
    return review


service_reviews_router = APIRouter(tags=["reviews"])


@service_reviews_router.get("/services/{service_id}/reviews", response_model=List[ReviewResponse])
def service_reviews(
    service_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return (
        db.query(Review)
        .filter(Review.service_id == service_id, Review.is_published == True)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
