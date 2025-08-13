import os
import jwt
from fastapi import HTTPException, Depends, Header, Request
from jwt import PyJWKClient
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User

# Get Clerk API Key from environment variables
CLERK_FRONTEND_API = os.getenv("CLERK_FRONTEND_API")
CLERK_JWKS_URL = f"{CLERK_FRONTEND_API}/.well-known/jwks.json"
if not CLERK_JWKS_URL:
    raise RuntimeError("❌ Missing CLERK_DOMAIN environment variable!")

def get_token(authorization: str = Header(None)):
    """Extracts the Bearer token from the request."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    return authorization.split(" ")[1]

def verify_clerk_token(request: Request, token: str = Depends(get_token)):
    """Verifies the Clerk JWT using the public JWKS, skipping `aud` validation."""

    print("Authenticating...")

    if "stripe-signature" in request.headers:
        print("✅ Stripe webhook detected. Skipping authentication.")
        return None  # Skip token validation

    try:
        jwks_client = PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Skip `audience` check since it doesn't exist in Clerk's token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=f"{os.getenv('CLERK_FRONTEND_API')}",
            options={"verify_aud": False, "verify_iat": True},
            leeway=10  # allow 10 seconds of clock skew
        )

        return payload  # Returns user details

    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidIssuerError as e:
        print(f"❌ Invalid issuer: {e}")
        raise HTTPException(status_code=401, detail="Invalid issuer")
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_clerk_token_optional(request: Request):
    auth_header = request.headers.get("authorization")

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        return verify_clerk_token(request, token=token)

    # No token provided → treat as guest
    return None

# ==========================================
# NEW: ADMIN AUTHENTICATION FOR ANALYTICS
# ==========================================

async def get_current_admin_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify admin authentication for analytics endpoints
    Uses existing Clerk token verification + admin check
    """
    
    # Development mode - skip auth checks
    if os.getenv("ENVIRONMENT") == "development" or os.getenv("NODE_ENV") == "development":
        print("⚠️  Development mode: Skipping admin authentication")
        return {
            "id": "dev_admin",
            "is_admin": True,
            "email": "admin@jasonandco.com",
            "clerk_id": "dev_admin_clerk_id",
            "permissions": ["admin:read", "admin:write", "analytics:read"]
        }
    
    try:
        # Use existing Clerk token verification
        clerk_payload = verify_clerk_token(request)
        
        if not clerk_payload:
            raise HTTPException(
                status_code=401,
                detail="Authentication required"
            )
        
        # Get user from database using Clerk ID
        clerk_id = clerk_payload.get("sub")
        if not clerk_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )
        
        # Check if user exists and is admin
        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Check if user is admin (adjust this based on your User model)
        # You might have an is_admin field or check email domains
        is_admin = (
            getattr(user, 'is_admin', False) or  # If you have is_admin field
            user.email.endswith('@jasonjewels.com') or  # Admin email domain
            user.email in ['admin@jasonandco.com', 'jason@jasonandco.com', 'jyushuvayev98@gmail.com']  # Specific admin emails
        )
        
        if not is_admin:
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )
        
        return {
            "id": user.id,
            "clerk_id": user.clerk_id,
            "email": user.email,
            "first_name": getattr(user, 'first_name', ''),
            "last_name": getattr(user, 'last_name', ''),
            "is_admin": True,
            "permissions": ["admin:read", "admin:write", "analytics:read"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Admin authentication error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Authentication system error"
        )