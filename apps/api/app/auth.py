import os
import jwt
from fastapi import HTTPException, Depends, Header, Request
from jwt import PyJWKClient

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

        # Skip `audience` check since it doesn’t exist in Clerk’s token
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

def verify_clerk_token_optional(request: Request, token: str = Depends(get_token)):
    auth_header = request.headers.get("authorization")

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        return verify_clerk_token(request, token=token)

    # No token provided → treat as guest
    return None