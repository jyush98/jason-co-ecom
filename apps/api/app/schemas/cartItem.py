from typing import Optional
from pydantic import BaseModel
from .product import ProductSchemaLegacy

class CartItemSchema(BaseModel):
    id: Optional[int] = None  # allow omission for guests
    user_id: Optional[str] = None  # allow omission for guests
    product_id: int
    quantity: int
    product: ProductSchemaLegacy

    class Config:
        from_attributes = True
