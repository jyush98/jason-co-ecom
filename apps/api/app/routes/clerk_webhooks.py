from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User

router = APIRouter()

@router.post("/clerk-webhook")  # ✅ Explicitly define POST
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()

    if "type" not in payload or payload["type"] != "user.created":
        raise HTTPException(status_code=400, detail="Invalid event type")

    user_data = payload.get("data")
    if not user_data:
        raise HTTPException(status_code=400, detail="No user data received")

    # Check if user already exists
    existing_user = db.query(User).filter(User.clerk_id == user_data["id"]).first()
    if existing_user:
        return {"message": "User already exists"}

    # Create new user
    new_user = User(
        clerk_id=user_data["id"],
        email=user_data["email_addresses"][0]["email_address"],
        first_name=user_data.get("first_name"),
        last_name=user_data.get("last_name"),
    )
    db.add(new_user)
    db.commit()

    return {"message": "User synchronized", "user_id": new_user.id}
