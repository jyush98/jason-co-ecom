import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://jewelry_user:securepassword@localhost/jewelry_db")
