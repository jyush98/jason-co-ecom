from pydantic import BaseModel

class UserSchema(BaseModel):
    clerk_id: str
    email: str
    first_name: str | None
    last_name: str | None

    class Config:
        from_attributes = True
