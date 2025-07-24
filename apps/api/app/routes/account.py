# routes/account.py - Address Management API Endpoints for Jason & Co.
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from app.core.db import get_db
from app.models.user import User
from app.models.user_address import UserAddress
from app.auth import verify_clerk_token

router = APIRouter()

# Pydantic models for request/response
class CreateAddressRequest(BaseModel):
    label: str = Field(..., min_length=1, max_length=100, description="Address label like 'Home' or 'Work'")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    address_line_1: str = Field(..., min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    country: str = Field(default="US", max_length=2)
    is_default: bool = Field(default=False)
    
    @validator('country')
    def validate_country(cls, v):
        if v:
            v = v.upper()
            valid_countries = ['US', 'CA', 'GB', 'AU', 'FR', 'DE', 'IT', 'ES']
            if v not in valid_countries:
                raise ValueError(f'Country code must be one of: {", ".join(valid_countries)}')
        return v
    
    @validator('postal_code')
    def validate_postal_code(cls, v):
        if v and len(v.strip()) < 3:
            raise ValueError('Postal code must be at least 3 characters')
        return v.strip()

class UpdateAddressRequest(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    address_line_1: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=3, max_length=20)
    country: Optional[str] = Field(None, max_length=2)
    is_default: Optional[bool] = None

def get_user_by_clerk_id(db: Session, clerk_id: str) -> User:
    """Helper function to get user by Clerk ID."""
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/addresses")
def get_user_addresses(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get all addresses for the authenticated user."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get addresses (active only)
        addresses = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.is_active == True
        ).order_by(
            UserAddress.is_default.desc(),  # Default first
            UserAddress.created_at.desc()   # Then newest first
        ).all()
        
        # Convert to response format
        return [address.to_dict() for address in addresses]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get addresses: {str(e)}")

@router.post("/addresses")
def create_address(
    request: CreateAddressRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Create a new address for the authenticated user."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Check if label already exists for this user
        existing_address = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.label.ilike(request.label),  # Case-insensitive
            UserAddress.is_active == True
        ).first()
        
        if existing_address:
            raise HTTPException(
                status_code=400, 
                detail=f"You already have an address labeled '{request.label}'. Please choose a different label."
            )
        
        # If this is being set as default, unset other defaults
        if request.is_default:
            db.query(UserAddress).filter(
                UserAddress.user_id == db_user.id,
                UserAddress.is_default == True,
                UserAddress.is_active == True
            ).update({"is_default": False})
        
        # If this is the user's first address, make it default automatically
        existing_count = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.is_active == True
        ).count()
        
        if existing_count == 0:
            request.is_default = True
        
        # Create the address
        address = UserAddress(
            user_id=db_user.id,
            label=request.label,
            first_name=request.first_name,
            last_name=request.last_name,
            company=request.company,
            phone=request.phone,
            address_line_1=request.address_line_1,
            address_line_2=request.address_line_2,
            city=request.city,
            state=request.state,
            postal_code=request.postal_code,
            country=request.country,
            is_default=request.is_default
        )
        
        db.add(address)
        db.commit()
        db.refresh(address)
        
        return {
            "success": True,
            "message": "Address created successfully",
            "address_id": address.id,
            "label": address.label,
            "is_default": address.is_default
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create address: {str(e)}")

@router.get("/addresses/{address_id}")
def get_address_by_id(
    address_id: int,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get a specific address by ID."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get address (ensure it belongs to the user)
        address = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.id == address_id,
            UserAddress.is_active == True
        ).first()
        
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        
        return address.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get address: {str(e)}")

@router.put("/addresses/{address_id}")
def update_address(
    address_id: int,
    request: UpdateAddressRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update a specific address."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get address (ensure it belongs to the user)
        address = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.id == address_id,
            UserAddress.is_active == True
        ).first()
        
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        
        # If updating label, check for uniqueness
        if request.label and request.label != address.label:
            label_conflict = db.query(UserAddress).filter(
                UserAddress.user_id == db_user.id,
                UserAddress.label.ilike(request.label),
                UserAddress.is_active == True,
                UserAddress.id != address_id
            ).first()
            
            if label_conflict:
                raise HTTPException(
                    status_code=400,
                    detail=f"You already have an address labeled '{request.label}'. Please choose a different label."
                )
        
        # If setting as default, unset other defaults
        if request.is_default:
            db.query(UserAddress).filter(
                UserAddress.user_id == db_user.id,
                UserAddress.is_default == True,
                UserAddress.is_active == True,
                UserAddress.id != address_id
            ).update({"is_default": False})
        
        # Update the address (only update fields that are provided)
        update_data = {}
        for field, value in request.dict().items():
            if value is not None:
                update_data[field] = value
        
        # Apply updates
        for key, value in update_data.items():
            setattr(address, key, value)
        
        db.commit()
        db.refresh(address)
        
        return {
            "success": True,
            "message": "Address updated successfully",
            "address_id": address_id,
            "label": address.label,
            "is_default": address.is_default
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update address: {str(e)}")

@router.post("/addresses/{address_id}/set-default")
def set_address_as_default(
    address_id: int,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Set an address as the default for the user."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get address (ensure it belongs to the user)
        address = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.id == address_id,
            UserAddress.is_active == True
        ).first()
        
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        
        # Unset all other defaults for this user
        db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.is_default == True,
            UserAddress.is_active == True
        ).update({"is_default": False})
        
        # Set this address as default
        address.is_default = True
        db.commit()
        
        return {
            "success": True,
            "message": "Default address updated successfully",
            "address_id": address_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set default address: {str(e)}")

@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: int,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Delete an address (soft delete)."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get address (ensure it belongs to the user)
        address = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.id == address_id,
            UserAddress.is_active == True
        ).first()
        
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        
        # Check if this is the user's only address
        active_addresses = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.is_active == True
        ).count()
        
        if active_addresses == 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete your only address. Please add another address first."
            )
        
        # Soft delete - mark as inactive
        address.is_active = False
        
        # If this was the default address, set another as default
        if address.is_default:
            other_address = db.query(UserAddress).filter(
                UserAddress.user_id == db_user.id,
                UserAddress.is_active == True,
                UserAddress.id != address_id
            ).first()
            
            if other_address:
                other_address.is_default = True
        
        db.commit()
        
        return {
            "success": True,
            "message": "Address deleted successfully",
            "address_id": address_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete address: {str(e)}")

# Utility endpoints for checkout integration
@router.get("/addresses/default")
def get_default_address(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get the user's default address."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get default address
        address = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.is_default == True,
            UserAddress.is_active == True
        ).first()
        
        if not address:
            raise HTTPException(status_code=404, detail="No default address found")
        
        return address.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get default address: {str(e)}")

@router.get("/addresses/shipping")
def get_shipping_addresses(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get all addresses that can be used for shipping."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get shipping addresses
        addresses = db.query(UserAddress).filter(
            UserAddress.user_id == db_user.id,
            UserAddress.is_shipping == True,
            UserAddress.is_active == True
        ).order_by(
            UserAddress.is_default.desc(),
            UserAddress.created_at.desc()
        ).all()
        
        return [address.to_dict() for address in addresses]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get shipping addresses: {str(e)}")