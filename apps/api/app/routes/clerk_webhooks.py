# Replace your clerk_webhooks.py with this enhanced version:

import json
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User

router = APIRouter()

@router.post("/webhooks/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    print("\n" + "="*50)
    print("🚨 WEBHOOK CALLED! 🚨")
    print("="*50)
    
    try:
        # Get the raw payload
        payload = await request.json()
        print("✅ Payload received successfully")
        print("🔹 Full Webhook Payload:")
        print(json.dumps(payload, indent=2))
        
    except Exception as e:
        print(f"❌ Failed to parse JSON payload: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")

    # Extract event info
    event_type = payload.get("type")
    user_data = payload.get("data")
    
    print(f"📧 Event Type: {event_type}")
    print(f"👤 User Data Present: {bool(user_data)}")

    if not user_data:
        print("❌ No user data received in payload!")
        raise HTTPException(status_code=400, detail="No user data received")

    # Extract user info
    clerk_id = user_data.get("id")
    email_addresses = user_data.get("email_addresses", [])
    email = email_addresses[0]["email_address"] if email_addresses else None
    
    print(f"🆔 Clerk ID: {clerk_id}")
    print(f"📧 Email: {email}")
    print(f"📧 Email Addresses Array: {email_addresses}")

    if event_type == "user.created":
        print("🎯 Processing user.created event...")

        if not email:
            print("❌ Missing email in Clerk webhook payload")
            print(f"📧 Email addresses received: {email_addresses}")
            raise HTTPException(status_code=400, detail="Email is missing from Clerk webhook")

        if not clerk_id:
            print("❌ Missing clerk_id in webhook payload")
            raise HTTPException(status_code=400, detail="Clerk ID is missing")

        # Check if user already exists
        existing_user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if existing_user:
            print(f"⚠️ User {clerk_id} already exists in DB")
            print(f"📧 Existing user email: {existing_user.email}")
            return {"message": "User already exists", "user_id": existing_user.id}

        try:
            # Create new user
            print("🔄 Creating new user in database...")
            new_user = User(
                clerk_id=clerk_id,
                email=email,
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
            )
            
            print(f"📝 User object created:")
            print(f"   - clerk_id: {new_user.clerk_id}")
            print(f"   - email: {new_user.email}")
            print(f"   - first_name: {new_user.first_name}")
            print(f"   - last_name: {new_user.last_name}")
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            print(f"✅ SUCCESS! User created with database ID: {new_user.id}")
            print(f"✅ User {clerk_id} successfully added to DB")
            
            # Verify the user was created
            verification = db.query(User).filter(User.clerk_id == clerk_id).first()
            if verification:
                print(f"✅ VERIFICATION: User found in DB with ID {verification.id}")
            else:
                print("❌ VERIFICATION FAILED: User not found after creation!")
                
            return {
                "message": "User created successfully", 
                "user_id": new_user.id,
                "clerk_id": clerk_id
            }
            
        except Exception as e:
            print(f"❌ Database error while creating user: {e}")
            print(f"❌ Exception type: {type(e)}")
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {e}")
    
    else:
        print(f"ℹ️ Unhandled event type: {event_type}")
        return {"message": f"Unhandled event: {event_type}"}

@router.get("/webhooks/test")
def test_webhook_endpoint():
    """Test endpoint to verify webhook URL is accessible"""
    print("🧪 Webhook test endpoint called")
    return {"message": "Webhook endpoint is working!", "status": "ok"}