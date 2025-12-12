-- Performance Optimization Indexes
-- This migration adds critical indexes to improve query performance and reduce CPU usage
-- Created: 2025-12-12

-- HIGH PRIORITY INDEXES

-- Bookings table - Most queried table
CREATE INDEX IF NOT EXISTS idx_bookings_date_barber 
ON bookings(date, barber_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user_date 
ON bookings(user_id, date);

CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status) 
WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_date_status 
ON bookings(date, status);

-- Barber schedules - Used for availability checks
CREATE INDEX IF NOT EXISTS idx_barber_schedules_barber_date 
ON barber_schedules(barber_id, date);

CREATE INDEX IF NOT EXISTS idx_barber_schedules_date 
ON barber_schedules(date);

-- Barber closures - Checked on every availability request
CREATE INDEX IF NOT EXISTS idx_barber_closures_email_date 
ON barber_closures(barber_email, closure_date);

CREATE INDEX IF NOT EXISTS idx_barber_closures_date 
ON barber_closures(closure_date);

-- MEDIUM PRIORITY INDEXES

-- Waitlist table
CREATE INDEX IF NOT EXISTS idx_waitlist_date_barber 
ON waitlist(date, barber_id, status);

CREATE INDEX IF NOT EXISTS idx_waitlist_user 
ON waitlist(user_id, status);

-- Users table - For authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_phone 
ON users(phone);

-- LOW PRIORITY INDEXES

-- Bookings created_at for sorting
CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
ON bookings(created_at DESC);

-- Verify indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
