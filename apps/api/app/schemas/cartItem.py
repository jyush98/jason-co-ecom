from pydantic import BaseModel
from .product import ProductSchema

class CartItemSchema(BaseModel):
    id: int
    user_id: str
    product_id: int
    quantity: int
    
    product: ProductSchema

    class Config:
        from_attributes = True

