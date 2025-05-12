import os
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from tempfile import NamedTemporaryFile
import shutil
from app.utils.s3 import upload_inspiration_image

router = APIRouter()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
# Uncomment in production
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "jyushuvayev98@gmail.com")

@router.post("/api/custom-order")
async def submit_custom_order(
    name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(""),
    message: str = Form(...),
    inspiration: UploadFile = File(None)
):
    try:
        image_url = "No image uploaded"
        if inspiration:
            image_url = upload_inspiration_image(inspiration)

        email_body = f"""
🛠️ New Custom Inquiry

Name: {name}
Phone: {phone}
Email: {email}
Message:
{message}

Inspiration: {image_url}
        """.strip()

        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
                "Content-Type": "application/json",
            },
            json={
                "from": "custom-orders@resend.dev",
                "to": [os.getenv("ADMIN_EMAIL")],
                "subject": f"New Custom Order Inquiry from {name}",
                "text": email_body,
            },
        )

        if response.status_code != 200:
            print(response.text)
            raise HTTPException(status_code=500, detail="Resend API error")

        return JSONResponse(status_code=200, content={"message": "Inquiry submitted!"})

    except Exception as e:
        print(f"❌ Error submitting custom inquiry: {e}")
        raise HTTPException(status_code=500, detail="Server error.")