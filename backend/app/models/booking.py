import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey,
    Date, Time, DateTime, Text, Numeric, Float, JSON, Index,
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class TimeSlot(Base, TimestampMixin):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    capacity = Column(Integer, default=1)
    booked_count = Column(Integer, default=0)
    is_blocked = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    bookings = relationship("Booking", back_populates="slot")

    __table_args__ = (Index("ix_time_slots_date_blocked", "date", "is_blocked"),)


class PromoCode(Base, TimestampMixin):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_type = Column(String(20), nullable=False)  # percent or fixed
    discount_value = Column(Numeric(10, 2), nullable=False)
    max_uses = Column(Integer, nullable=True)
    uses_count = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="promo_code")


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("user_vehicles.id"), nullable=True)
    slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    promo_code_id = Column(Integer, ForeignKey("promo_codes.id"), nullable=True)
    addon_ids = Column(JSON, nullable=True, default=list)
    status = Column(String(20), default=BookingStatus.pending, nullable=False, index=True)
    pickup_required = Column(Boolean, default=False)
    pickup_address = Column(Text, nullable=True)
    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    total_price = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0)
    payment_status = Column(String(20), default=PaymentStatus.pending, nullable=False)

    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    service = relationship("Service")
    vehicle = relationship("UserVehicle", back_populates="bookings")
    slot = relationship("TimeSlot", back_populates="bookings")
    promo_code = relationship("PromoCode", back_populates="bookings")
    status_history = relationship(
        "BookingStatusHistory", back_populates="booking", cascade="all, delete-orphan"
    )
    photos = relationship("BookingPhoto", back_populates="booking", cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False)
    loyalty_transactions = relationship("LoyaltyTransaction", back_populates="booking")


class BookingStatusHistory(Base):
    __tablename__ = "booking_status_history"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)

    booking = relationship("Booking", back_populates="status_history")


class BookingPhoto(Base, TimestampMixin):
    __tablename__ = "booking_photos"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    photo_url = Column(String(500), nullable=False)
    type = Column(String(10), nullable=False)  # before or after
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    booking = relationship("Booking", back_populates="photos")
