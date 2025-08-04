"""update existing custom orders

Revision ID: d6b0ac73ff39
Revises: a334ca4b7d12
Create Date: 2025-08-04 13:27:34.762991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text
from datetime import datetime

# revision identifiers, used by Alembic.
revision: str = 'd6b0ac73ff39'
down_revision: Union[str, None] = 'a334ca4b7d12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Get connection to execute raw SQL
    connection = op.get_bind()
    
    # Update existing orders with default values for new required fields
    connection.execute(text("""
        UPDATE custom_orders 
        SET 
            status = COALESCE(status, 'inquiry'),
            priority = COALESCE(priority, 'standard'),
            current_step = COALESCE(current_step, 4), -- Assume existing orders are complete
            is_draft = COALESCE(is_draft, false), -- Existing orders are not drafts
            form_completion_percentage = COALESCE(form_completion_percentage, 100.0), -- Mark as complete
            marketing_consent = COALESCE(marketing_consent, false),
            updated_at = CURRENT_TIMESTAMP
        WHERE id IS NOT NULL
    """))
    
    # Map existing message field to project_description for better structure
    connection.execute(text("""
        UPDATE custom_orders 
        SET project_description = message 
        WHERE message IS NOT NULL 
        AND message != '' 
        AND project_description IS NULL
    """))
    
    # Create initial timeline entries for all existing orders
    connection.execute(text("""
        INSERT INTO custom_order_timeline (custom_order_id, milestone, description, is_completed, completed_at, created_at)
        SELECT 
            co.id,
            'inquiry_received',
            'Initial custom order inquiry received (migrated from legacy system)',
            true,
            co.created_at,
            co.created_at
        FROM custom_orders co
        WHERE NOT EXISTS (
            SELECT 1 FROM custom_order_timeline cot 
            WHERE cot.custom_order_id = co.id 
            AND cot.milestone = 'inquiry_received'
        )
    """))
    
    # Add follow-up timeline entries for orders that might need attention
    connection.execute(text("""
        INSERT INTO custom_order_timeline (custom_order_id, milestone, description, is_completed, estimated_date, created_at)
        SELECT 
            co.id,
            'quote_preparation',
            'Quote preparation needed for migrated order',
            false,
            CURRENT_TIMESTAMP + INTERVAL '3 days',
            CURRENT_TIMESTAMP
        FROM custom_orders co
        WHERE co.status = 'inquiry'
        AND NOT EXISTS (
            SELECT 1 FROM custom_order_timeline cot 
            WHERE cot.custom_order_id = co.id 
            AND cot.milestone IN ('quote_preparation', 'quote_sent', 'completed')
        )
    """))
    
    # Migrate single image_url to the new images table structure
    connection.execute(text("""
        INSERT INTO custom_order_images (custom_order_id, image_url, image_type, caption, upload_order, created_at)
        SELECT 
            co.id,
            co.image_url,
            'inspiration',
            'Legacy uploaded image',
            0,
            co.created_at
        FROM custom_orders co
        WHERE co.image_url IS NOT NULL 
        AND co.image_url != '' 
        AND co.image_url != 'No image uploaded'
        AND NOT EXISTS (
            SELECT 1 FROM custom_order_images coi 
            WHERE coi.custom_order_id = co.id
        )
    """))
    
    # Set basic project types based on message content analysis (simple heuristic)
    connection.execute(text("""
        UPDATE custom_orders 
        SET project_type = CASE
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%furniture%' 
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%chair%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%table%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%sofa%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%desk%'
                THEN 'furniture'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%light%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%lamp%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%chandelier%'
                THEN 'lighting'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%room%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%space%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%interior%'
                THEN 'full_room'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%decor%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%accessory%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%art%'
                THEN 'decor'
            ELSE 'furniture' -- Default fallback
        END
        WHERE project_type IS NULL
    """))
    
    # Set basic room types based on message content
    connection.execute(text("""
        UPDATE custom_orders 
        SET room_type = CASE
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%living room%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%living%'
                THEN 'living_room'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%bedroom%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%bed room%'
                THEN 'bedroom'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%kitchen%'
                THEN 'kitchen'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%office%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%study%'
                THEN 'office'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%dining%'
                THEN 'dining_room'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%bathroom%'
                THEN 'bathroom'
            ELSE 'living_room' -- Default fallback
        END
        WHERE room_type IS NULL
    """))
    
    # Set basic style preferences based on message content
    connection.execute(text("""
        UPDATE custom_orders 
        SET style_preference = CASE
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%modern%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%contemporary%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%minimalist%'
                THEN 'modern'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%traditional%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%classic%'
                THEN 'traditional'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%rustic%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%farmhouse%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%wood%'
                THEN 'rustic'
            WHEN LOWER(COALESCE(message, project_description, '')) LIKE '%industrial%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%metal%'
                OR LOWER(COALESCE(message, project_description, '')) LIKE '%steel%'
                THEN 'industrial'
            ELSE 'modern' -- Default fallback
        END
        WHERE style_preference IS NULL
    """))
    
    # Set communication preferences to email for existing customers
    connection.execute(text("""
        UPDATE custom_orders 
        SET communication_preferences = '["email"]'::json
        WHERE communication_preferences IS NULL
        AND email IS NOT NULL
        AND email != ''
    """))
    
    print(f"✅ Data migration completed at {datetime.now()}")


def downgrade():
    # Remove migrated timeline entries
    connection = op.get_bind()
    
    connection.execute(text("""
        DELETE FROM custom_order_timeline 
        WHERE description LIKE '%migrated from legacy system%'
        OR description LIKE '%needed for migrated order%'
    """))
    
    # Remove migrated images
    connection.execute(text("""
        DELETE FROM custom_order_images 
        WHERE caption = 'Legacy uploaded image'
    """))
    
    # Reset migrated fields to NULL
    connection.execute(text("""
        UPDATE custom_orders 
        SET 
            project_type = NULL,
            room_type = NULL,
            style_preference = NULL,
            communication_preferences = NULL
        WHERE project_description = message -- Only reset auto-migrated data
    """))
    
    print(f"✅ Data migration rollback completed at {datetime.now()}")
