-- Fix waiver signatures constraint to allow multiple lessons per payment
-- This removes the overly restrictive unique constraint and replaces it with a proper one

-- Step 1: Drop the existing constraint that prevents multiple waivers per payment
ALTER TABLE waiver_signatures 
DROP CONSTRAINT IF EXISTS unique_payment_intent_waiver;

-- Step 2: Add a new constraint that allows multiple waivers per payment but prevents duplicates per slot
-- This allows one waiver per slot per payment intent (which is what we want for multiple lessons)
ALTER TABLE waiver_signatures 
ADD CONSTRAINT unique_payment_intent_slot_waiver 
UNIQUE (payment_intent_id, slot_id);

-- Step 3: Add a comment to explain the constraint
COMMENT ON CONSTRAINT unique_payment_intent_slot_waiver ON waiver_signatures IS 'Prevents duplicate waiver signatures for the same slot within a payment, but allows multiple slots per payment (multiple lessons)';

-- Verification query (optional - you can run this to check the data)
-- SELECT payment_intent_id, slot_id, participant_name, COUNT(*) 
-- FROM waiver_signatures 
-- WHERE payment_intent_id IS NOT NULL 
-- GROUP BY payment_intent_id, slot_id, participant_name
-- HAVING COUNT(*) > 1; 