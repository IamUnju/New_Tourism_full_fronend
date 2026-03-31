"""initial_schema

Revision ID: fbee880fef30
Revises: 
Create Date: 2026-03-31 10:00:29.914323

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql


revision: str = 'fbee880fef30'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    existing = set(inspect(op.get_bind()).get_table_names())

    userrole_enum = postgresql.ENUM('admin', 'customer', name='userrole', create_type=False)
    bookingstatus_enum = postgresql.ENUM('pending', 'confirmed', 'cancelled', 'completed', name='bookingstatus', create_type=False)
    tripplanstatus_enum = postgresql.ENUM('pending', 'reviewing', 'quoted', 'confirmed', 'cancelled', name='tripplanstatus', create_type=False)

    op.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
                CREATE TYPE userrole AS ENUM ('admin', 'customer');
            END IF;
        END $$;
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookingstatus') THEN
                CREATE TYPE bookingstatus AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
            END IF;
        END $$;
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tripplanstatus') THEN
                CREATE TYPE tripplanstatus AS ENUM ('pending', 'reviewing', 'quoted', 'confirmed', 'cancelled');
            END IF;
        END $$;
    """))

    if 'users' not in existing:
        op.create_table(
            'users',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('hashed_password', sa.String(255), nullable=False),
            sa.Column('role', userrole_enum, nullable=False, server_default='customer'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'tours' not in existing:
        op.create_table(
            'tours',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('title', sa.String(255), nullable=False, index=True),
            sa.Column('slug', sa.String(255), nullable=False, unique=True, index=True),
            sa.Column('subtitle', sa.String(500), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('price', sa.Float(), nullable=False),
            sa.Column('duration', sa.String(100), nullable=False),
            sa.Column('location', sa.String(255), nullable=False),
            sa.Column('group_size', sa.String(100), nullable=True),
            sa.Column('category', sa.String(100), nullable=False, server_default='Safari'),
            sa.Column('badge', sa.String(100), nullable=True),
            sa.Column('highlights', sa.JSON(), nullable=True),
            sa.Column('itinerary', sa.JSON(), nullable=True),
            sa.Column('included', sa.JSON(), nullable=True),
            sa.Column('excluded', sa.JSON(), nullable=True),
            sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('is_featured', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column('rating', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('review_count', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'tour_images' not in existing:
        op.create_table(
            'tour_images',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('tour_id', sa.Integer(), sa.ForeignKey('tours.id', ondelete='CASCADE'), nullable=False),
            sa.Column('url', sa.String(1000), nullable=False),
            sa.Column('public_id', sa.String(500), nullable=True),
            sa.Column('is_cover', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'bookings' not in existing:
        op.create_table(
            'bookings',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('tour_id', sa.Integer(), sa.ForeignKey('tours.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('travel_date', sa.Date(), nullable=False),
            sa.Column('guests', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('total_price', sa.Float(), nullable=False),
            sa.Column('status', bookingstatus_enum, nullable=False, server_default='pending'),
            sa.Column('special_requests', sa.Text(), nullable=True),
            sa.Column('contact_name', sa.String(255), nullable=False),
            sa.Column('contact_email', sa.String(255), nullable=False),
            sa.Column('contact_phone', sa.String(50), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'inquiries' not in existing:
        op.create_table(
            'inquiries',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('email', sa.String(255), nullable=False, index=True),
            sa.Column('phone', sa.String(50), nullable=True),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('tour_interest', sa.String(255), nullable=True),
            sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('is_replied', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'media' not in existing:
        op.create_table(
            'media',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('url', sa.String(1000), nullable=False),
            sa.Column('public_id', sa.String(500), nullable=True, unique=True),
            sa.Column('filename', sa.String(255), nullable=True),
            sa.Column('file_size', sa.Integer(), nullable=True),
            sa.Column('content_type', sa.String(100), nullable=True),
            sa.Column('tour_id', sa.Integer(), sa.ForeignKey('tours.id', ondelete='SET NULL'), nullable=True, index=True),
            sa.Column('uploaded_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'testimonials' not in existing:
        op.create_table(
            'testimonials',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
            sa.Column('tour_id', sa.Integer(), sa.ForeignKey('tours.id', ondelete='SET NULL'), nullable=True, index=True),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('location', sa.String(255), nullable=True),
            sa.Column('rating', sa.Integer(), nullable=False, server_default='5'),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('avatar_url', sa.String(1000), nullable=True),
            sa.Column('is_approved', sa.Boolean(), nullable=False, server_default=sa.false(), index=True),
            sa.Column('is_featured', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )

    if 'trip_plans' not in existing:
        op.create_table(
            'trip_plans',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('email', sa.String(255), nullable=False),
            sa.Column('phone', sa.String(50), nullable=True),
            sa.Column('destination', sa.String(255), nullable=False),
            sa.Column('budget', sa.Float(), nullable=True),
            sa.Column('number_of_people', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('travel_dates', sa.String(255), nullable=True),
            sa.Column('duration_days', sa.Integer(), nullable=True),
            sa.Column('preferences', sa.JSON(), nullable=True),
            sa.Column('special_requirements', sa.Text(), nullable=True),
            sa.Column('status', tripplanstatus_enum, nullable=False, server_default='pending'),
            sa.Column('admin_notes', sa.Text(), nullable=True),
            sa.Column('quoted_price', sa.Float(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    op.drop_table('trip_plans')
    op.drop_table('testimonials')
    op.drop_table('media')
    op.drop_table('inquiries')
    op.drop_table('bookings')
    op.drop_table('tour_images')
    op.drop_table('tours')
    op.drop_table('users')
    op.execute("DROP TYPE IF EXISTS tripplanstatus")
    op.execute("DROP TYPE IF EXISTS bookingstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
