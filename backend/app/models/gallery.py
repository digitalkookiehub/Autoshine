from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class GalleryItem(Base, TimestampMixin):
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    before_url = Column(String(500), nullable=False)
    after_url = Column(String(500), nullable=False)
    video_url = Column(String(500), nullable=True)
    caption = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    is_featured = Column(Boolean, default=False, index=True)
    likes_count = Column(Integer, default=0)

    service = relationship("Service", back_populates="gallery_items")
