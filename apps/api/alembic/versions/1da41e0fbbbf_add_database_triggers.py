"""add database triggers

Revision ID: 1da41e0fbbbf
Revises: d6b0ac73ff39
Create Date: 2025-08-04 13:30:07.150901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '1da41e0fbbbf'
down_revision: Union[str, None] = 'd6b0ac73ff39'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Get connection to execute raw SQL
    connection = op.get_bind()
    
    # Create the trigger function for updated_at columns
    connection.execute(text("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """))
    
    # Create trigger for custom_orders table
    connection.execute(text("""
        CREATE TRIGGER update_custom_orders_updated_at 
            BEFORE UPDATE ON custom_orders 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    """))
    
    # Create trigger for design_consultations table
    connection.execute(text("""
        CREATE TRIGGER update_design_consultations_updated_at 
            BEFORE UPDATE ON design_consultations 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    """))
    
    print("✅ Database triggers created successfully")


def downgrade():
    # Get connection to execute raw SQL
    connection = op.get_bind()
    
    # Drop triggers
    connection.execute(text("""
        DROP TRIGGER IF EXISTS update_design_consultations_updated_at ON design_consultations;
    """))
    
    connection.execute(text("""
        DROP TRIGGER IF EXISTS update_custom_orders_updated_at ON custom_orders;
    """))
    
    # Drop the trigger function
    connection.execute(text("""
        DROP FUNCTION IF EXISTS update_updated_at_column();
    """))
    
    print("✅ Database triggers removed successfully")
