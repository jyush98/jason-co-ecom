from pydantic import BaseModel
from typing import Optional

class ProductSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    category: str

    class Config:
        from_attributes = True  # ✅ Allows conversion from SQLAlchemy models
