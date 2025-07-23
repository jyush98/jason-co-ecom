from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()  # Very important: Define Base *once*

from app.models.product import Product
from app.models.user import User
from app.models.cart import CartItem
from app.models.order import OrderItem, Order
from app.models.custom_order import CustomOrder
from app.models.wishlist import WishlistItem
# Import other models here