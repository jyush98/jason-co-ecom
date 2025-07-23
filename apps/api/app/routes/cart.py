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