from pydantic import BaseModel
from typing import Optional, List

class ProductSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    image_urls: Optional[List[str]] = []
    category: str
    featured: bool

    class Config:
        from_attributes = True  # ✅ Allows conversion from SQLAlchemy models
