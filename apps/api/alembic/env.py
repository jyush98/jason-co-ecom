import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the Base class from the main app
from app.core.db import Base

# Import all models so Alembic detects them
from app.models.product import Product

# Get the database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Alembic Config object
config = context.config

# Set the database URL dynamically
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Configure logging
if config.config_file_name:
    fileConfig(config.config_file_name)

# Set up metadata for Alembic
target_metadata = Base.metadata


def run_migrations_offline():
    """
    Run migrations in 'offline' mode.
    This is used when you don't have a database connection.
    """
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """
    Run migrations in 'online' mode.
    This is used when you have a database connection.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

# Run migrations in the appropriate mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()