from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.db import Base
from datetime import datetime

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String, default="pending")  # 'pending', 'completed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ Establish a relationship to OrderItem
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String, nullable=False)  # Store product name for history
    unit_price = Column(Float, nullable=False)  # Price at time of purchase
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
