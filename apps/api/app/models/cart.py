import datetime
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.db import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.clerk_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.now)

    user = relationship("User", back_populates="cart_items", overlaps="cart_items")
    product = relationship("Product", back_populates="cart_items", overlaps="cart_items")
