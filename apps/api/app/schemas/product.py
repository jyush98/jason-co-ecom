from pydantic import BaseModel
from typing import Optional, List, Dict

class ProductSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    image_urls: Optional[List[str]] = []
    category: str
    featured: bool
    details: Optional[Dict[str, str]] = {}

    class Config:
        from_attributes = True  # ✅ Allows conversion from SQLAlchemy models
