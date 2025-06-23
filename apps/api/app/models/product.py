from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ARRAY
from app.core.db import Base  # Use the global Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base


class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    image_urls = Column(ARRAY(String))  # Store multiple image URLs as JSON
    category = Column(String, nullable=True)
    featured = Column(Boolean, nullable=False, default=False)
    details = Column(JSONB)
    display_theme = Column(String, default="dark")
    
    cart_items = relationship("CartItem", back_populates="product")