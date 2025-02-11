import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User
from app.auth import verify_clerk_token
import os

router = APIRouter()
CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")  # ✅ Get Clerk API Key

@router.get("/user/{clerk_id}")
def get_user(clerk_id: str, db: Session = Depends(get_db), auth_user=Depends(verify_clerk_token)):
    """Fetch a user by Clerk ID, only if authenticated."""
    print(f"🔹 Authenticated request from: {auth_user['sub']}")  # ✅ Fixed

    # Renamed `user` to `db_user` to avoid conflicts
    db_user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": db_user.id,
        "email": db_user.email,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
    }


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
