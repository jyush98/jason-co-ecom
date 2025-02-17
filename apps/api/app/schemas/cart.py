from pydantic import BaseModel
from .cartItem import CartItemSchema

class CartSchema(BaseModel):
    items: list[CartItemSchema]

    class Config:
        from_attributes = True

