from sqlalchemy import Column, Integer, String, Float, Text
from app.core.db import Base  # Use the global Base
from sqlalchemy.orm import relationship


class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    
    cart_items = relationship("CartItem", back_populates="product")