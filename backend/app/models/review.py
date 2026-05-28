from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    photos = Column(JSON, nullable=True)
    is_published = Column(Boolean, default=True)

    booking = relationship("Booking", back_populates="review")
    user = relationship("User", back_populates="reviews")
    service = relationship("Service", back_populates="reviews")

    __table_args__ = (UniqueConstraint("booking_id", name="uq_review_booking"),)
