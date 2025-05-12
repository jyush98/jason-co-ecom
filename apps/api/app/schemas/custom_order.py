from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CustomOrderCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]
    message: Optional[str]
    image_url: Optional[str]

class CustomOrderOut(CustomOrderCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
