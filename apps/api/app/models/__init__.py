from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()  # Very important: Define Base *once*

from app.models.product import Product  # Import your models
# Import other models if you have them: from .user import User, etc.