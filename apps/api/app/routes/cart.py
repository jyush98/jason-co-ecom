from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.auth import verify_clerk_token  # ✅ Ensure user authentication
from pydantic import BaseModel
from sqlalchemy import func  # ✅ Add this import

router = APIRouter()

class CartItemRequest(BaseModel):
    product_id: int
    quantity: int

# ✅ ADD THIS NEW ENDPOINT
@router.get("/count")
def get_cart_count(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get the total number of items in user's cart"""
    try:
        # Count total quantity of all items in cart
        cart_count = db.query(func.sum(CartItem.quantity)).filter(
            CartItem.user_id == user["sub"]
        ).scalar() or 0
        
        return {"count": int(cart_count)}
        
    except Exception as e:
        print(f"Error getting cart count: {e}")
        raise HTTPException(status_code=500, detail="Failed to get cart count")

@router.post("/add")
def add_to_cart(
    item: CartItemRequest,  # ✅ Expect JSON body
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Adds a product to the cart."""
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == user["sub"], CartItem.product_id == item.product_id
    ).first()

    if existing_item:
        existing_item.quantity += item.quantity
    else:
        cart_item = CartItem(user_id=user["sub"], product_id=item.product_id, quantity=item.quantity)
        db.add(cart_item)

    db.commit()
    return {"message": "Item added to cart"}

@router.get("")
def get_cart(user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    """Fetches the user's cart."""
    cart_items = db.query(CartItem).filter(CartItem.user_id == user["sub"]).all()
    for item in cart_items:
        item.product = db.query(Product).filter(Product.id == item.product_id).first()
    return cart_items

@router.delete("/remove/{product_id}")
def remove_from_cart(product_id: int, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    """Removes an item from the cart."""
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == user["sub"], CartItem.product_id == product_id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@router.post("/calculate-tax")
def calculate_tax(
    request: dict,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Calculate tax for cart based on shipping address"""
    try:
        state = request.get("state", "").upper()
        subtotal = float(request.get("subtotal", 0))
        shipping = float(request.get("shipping", 0))
        
        # Tax rates by state (same as frontend)
        TAX_RATES = {
            'AL': 0.04, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725, 'CO': 0.029,
            'CT': 0.0635, 'FL': 0.06, 'GA': 0.04, 'HI': 0.04, 'ID': 0.06,
            'IL': 0.0625, 'IN': 0.07, 'IA': 0.06, 'KS': 0.065, 'KY': 0.06,
            'LA': 0.0445, 'ME': 0.055, 'MD': 0.06, 'MA': 0.0625, 'MI': 0.06,
            'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225, 'NE': 0.055, 'NV': 0.0685,
            'NJ': 0.06625, 'NM': 0.05125, 'NY': 0.08, 'NC': 0.0475, 'ND': 0.05,
            'OH': 0.0575, 'OK': 0.045, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
            'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.0485, 'VT': 0.06,
            'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04
        }
        
        # States with no sales tax
        NO_TAX_STATES = ['AK', 'DE', 'MT', 'NH', 'OR']
        
        if state in NO_TAX_STATES:
            tax_rate = 0.0
        else:
            tax_rate = TAX_RATES.get(state, 0.08)  # Default 8% if state not found
        
        tax_amount = round(subtotal * tax_rate, 2)
        
        return {
            "state": state,
            "tax_rate": tax_rate,
            "tax_amount": tax_amount,
            "formatted_rate": f"{tax_rate * 100:.2f}%"
        }
        
    except Exception as e:
        print(f"Error calculating tax: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate tax")

@router.patch("/update")
def update_cart(
    item: CartItemRequest,  # JSON Body
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Updates the quantity of an item in the cart."""
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == user["sub"], CartItem.product_id == item.product_id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    if item.quantity > 0:
        cart_item.quantity = item.quantity
    else:
        db.delete(cart_item)

    db.commit()
    return {"message": "Cart updated"}