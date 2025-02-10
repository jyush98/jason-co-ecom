import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User
import os

router = APIRouter()
CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")  # ✅ Get Clerk API Key

@router.post("/sync-to-clerk/{user_id}")
def sync_user_to_clerk(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Send user to Clerk
    headers = {"Authorization": f"Bearer {CLERK_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "email_address": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    response = requests.post("https://api.clerk.dev/v1/users", json=payload, headers=headers)

    if response.status_code != 200:
        print(f"❌ Clerk Sync Failed: {response.text}")
        raise HTTPException(status_code=response.status_code, detail="Failed to sync user with Clerk")

    return {"message": "User synced to Clerk"}
