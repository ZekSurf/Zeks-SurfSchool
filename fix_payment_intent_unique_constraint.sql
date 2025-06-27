-- Migration to remove unique constraint on payment_intent_id in bookings table
-- This allows multiple lessons to be booked with the same payment intent

-- Step 1: Drop the unique constraint on payment_intent_id
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_intent_id_key;

-- Step 2: Add an index for performance (since we removed the unique constraint)
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent_id ON bookings(payment_intent_id);

-- Step 3: Verify the change by showing table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'payment_intent_id';

-- Step 4: Show any remaining constraints on the bookings table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'bookings'
ORDER BY tc.constraint_type, tc.constraint_name; 