-- Migration to remove unique constraint on payment_intent_id in bookings table
-- This allows multiple lessons to be booked with the same payment intent

-- Drop the unique constraint on payment_intent_id
-- First, get the constraint name (it might be auto-generated)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the unique constraint name for payment_intent_id
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'bookings'::regclass
    AND contype = 'u'
    AND array_to_string(
        ARRAY(
            SELECT attname 
            FROM pg_attribute 
            WHERE attrelid = conrelid 
            AND attnum = ANY(conkey)
        ), 
        ','
    ) = 'payment_intent_id';
    
    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped unique constraint % on payment_intent_id', constraint_name;
    ELSE
        RAISE NOTICE 'No unique constraint found on payment_intent_id';
    END IF;
END $$;

-- Add an index for performance (since we removed the unique constraint)
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent_id ON bookings(payment_intent_id);

-- Verify the change
\d bookings;

-- Optional: Show any remaining constraints
SELECT conname, contype, 
       array_to_string(
           ARRAY(
               SELECT attname 
               FROM pg_attribute 
               WHERE attrelid = conrelid 
               AND attnum = ANY(conkey)
           ), 
           ','
       ) as columns
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass; 