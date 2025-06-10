from typing import Optional
from pydantic import BaseModel
from .product import ProductSchema

class CartItemSchema(BaseModel):
    id: Optional[int] = None  # allow omission for guests
    user_id: Optional[str] = None  # allow omission for guests
    product_id: int
    quantity: int
    product: ProductSchema

    class Config:
        from_attributes = True
