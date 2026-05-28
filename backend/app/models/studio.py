from sqlalchemy import Column, Integer, String, Text
from app.database import Base
from app.models.base import TimestampMixin


class StudioSettings(Base, TimestampMixin):
    __tablename__ = "studio_settings"

    id = Column(Integer, primary_key=True, default=1)
    name = Column(String(200), nullable=False, default="Autoshine Studio")
    tagline = Column(String(300), nullable=True)
    logo_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    email = Column(String(100), nullable=True)
