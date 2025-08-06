from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()  # Very important: Define Base *once*

from app.models.product import Product
from app.models.user import User
from app.models.cart import CartItem
from app.models.order import OrderItem, Order
from app.models.custom_order import CustomOrder
from app.models.wishlist import WishlistItem
from app.models.user_address import UserAddress
from app.models.user_settings import UserSetting
from app.models.notification_preferences import NotificationPreference
from app.models.contact import ContactInquiry, ConsultationBooking, LocationNotification
from app.models.category import Category
from app.models.collection import Collection