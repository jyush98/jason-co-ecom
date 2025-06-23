from pydantic import BaseModel
from typing import Optional, List, Dict

class ProductSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str]
    image_urls: Optional[List[str]] = []
    category: Optional[str] = None
    featured: Optional[bool] = None
    details: Optional[Dict[str, str]] = {}
    display_theme: Optional[str] = "dark"

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
