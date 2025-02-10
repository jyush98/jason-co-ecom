import json
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User

router = APIRouter()

@router.post("/clerk-webhook")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    print("\n🔹 Clerk Webhook Payload:\n", json.dumps(payload, indent=2))  # ✅ Log payload

    event_type = payload.get("type")
    user_data = payload.get("data")

    if not user_data:
        print("❌ No user data received!")
        raise HTTPException(status_code=400, detail="No user data received")

    clerk_id = user_data.get("id")
    email = user_data["email_addresses"][0]["email_address"] if user_data.get("email_addresses") else None

    if event_type == "user.created":
        print(f"🔹 Processing user.created for Clerk ID: {clerk_id}")

        if not email:
            print("❌ Missing email in Clerk webhook payload")
            raise HTTPException(status_code=400, detail="Email is missing from Clerk webhook")

        existing_user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if existing_user:
            print(f"⚠️ User {clerk_id} already exists in DB")
            return {"message": "User already exists"}

        # ✅ Create and commit user to DB
        new_user = User(
            clerk_id=clerk_id,
            email=email,
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
        )
        db.add(new_user)
        db.commit()
        print(f"✅ User {clerk_id} added to DB")
        return {"message": "User created"}

    return {"message": "Unhandled event"}