from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Numeric, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class ServiceCategory(Base, TimestampMixin):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    icon_name = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    services = relationship("Service", back_populates="category")


class Service(Base, TimestampMixin):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    name = Column(String(200), nullable=False)
    tagline = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=60)
    image_url = Column(String(500), nullable=True)
    benefits = Column(JSON, nullable=True)
    rating_avg = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    category = relationship("ServiceCategory", back_populates="services")
    addons = relationship("ServiceAddon", back_populates="service", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="service")
    gallery_items = relationship("GalleryItem", back_populates="service")


class ServiceAddon(Base, TimestampMixin):
    __tablename__ = "service_addons"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)

    service = relationship("Service", back_populates="addons")
