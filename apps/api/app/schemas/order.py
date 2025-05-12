from pydantic import BaseModel
from typing import List
from datetime import datetime

class OrderItemSchema(BaseModel):
    product_id: int
    product_name: str
    unit_price: float
    quantity: int

    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime
    items: List[OrderItemSchema]

    class Config:
        from_attributes = True

class OrderResponseSchema(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime
    items: List[OrderItemSchema]

