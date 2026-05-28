from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.dependencies import get_current_user
from app.models.service import Service
from app.models.gallery import GalleryItem
from app.models.booking import Booking
from app.schemas.service import ServiceResponse
from app.schemas.gallery import GalleryItemResponse

router = APIRouter(prefix="/home", tags=["home"])


@router.get("")
def home_feed(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    featured_services = (
        db.query(Service)
        .options(joinedload(Service.category), joinedload(Service.addons))
        .filter(Service.is_active == True, Service.is_featured == True)
        .order_by(Service.display_order)
        .limit(6)
        .all()
    )
    gallery = (
        db.query(GalleryItem)
        .filter(GalleryItem.is_featured == True)
        .order_by(GalleryItem.created_at.desc())
        .limit(6)
        .all()
    )
    upcoming = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id,
            Booking.status.in_(["pending", "confirmed"]),
        )
        .order_by(Booking.created_at.desc())
        .first()
    )
    return {
        "featured_services": [ServiceResponse.model_validate(s) for s in featured_services],
        "gallery": [GalleryItemResponse.model_validate(g) for g in gallery],
        "upcoming_booking": upcoming,
        "loyalty_points": current_user.loyalty_points,
        "membership_tier": current_user.membership_tier,
    }


@router.get("/offers")
def active_offers(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.booking import PromoCode
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    promos = db.query(PromoCode).filter(
        PromoCode.is_active == True,
    ).all()
    return [
        {
            "id": p.id,
            "code": p.code,
            "discount_type": p.discount_type,
            "discount_value": float(p.discount_value),
            "expires_at": p.expires_at,
        }
        for p in promos
    ]
