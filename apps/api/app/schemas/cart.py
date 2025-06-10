from typing import Optional
from pydantic import BaseModel, EmailStr
from .cartItem import CartItemSchema

class CartSchema(BaseModel):
    items: list[CartItemSchema]
    guest_email: Optional[EmailStr] = None

    class Config:
        from_attributes = True
