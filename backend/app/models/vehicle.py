from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class UserVehicle(Base, TimestampMixin):
    __tablename__ = "user_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=True)
    color = Column(String(50), nullable=True)
    license_plate = Column(String(20), nullable=True)
    image_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="vehicles")
    bookings = relationship("Booking", back_populates="vehicle")
    reminders = relationship("ServiceReminder", back_populates="vehicle", cascade="all, delete-orphan")


class ServiceReminder(Base, TimestampMixin):
    __tablename__ = "service_reminders"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("user_vehicles.id", ondelete="CASCADE"), nullable=False)
    reminder_type = Column(String(100), nullable=False)
    due_date = Column(Date, nullable=False)
    is_sent = Column(Boolean, default=False)

    vehicle = relationship("UserVehicle", back_populates="reminders")
