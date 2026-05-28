import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, JSON, Numeric, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class MembershipPlan(Base, TimestampMixin):
    __tablename__ = "membership_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    price_monthly = Column(Numeric(10, 2), nullable=False)
    price_yearly = Column(Numeric(10, 2), nullable=False)
    benefits = Column(JSON, nullable=True)
    free_washes_per_month = Column(Integer, default=0)
    discount_percent = Column(Integer, default=0)
    priority_booking = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("UserMembership", back_populates="plan")


class UserMembership(Base, TimestampMixin):
    __tablename__ = "user_memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    plan_id = Column(Integer, ForeignKey("membership_plans.id"), nullable=False)
    status = Column(String(20), default="active", nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)

    user = relationship("User")
    plan = relationship("MembershipPlan", back_populates="subscriptions")


class LoyaltyTransaction(Base, TimestampMixin):
    __tablename__ = "loyalty_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    points = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False)  # earned, redeemed, bonus
    description = Column(Text, nullable=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)

    user = relationship("User", back_populates="loyalty_transactions")
    booking = relationship("Booking", back_populates="loyalty_transactions")
