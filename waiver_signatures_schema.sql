-- Waiver Signatures Table Schema for Zek's Surf School
-- This table stores legally binding waiver signatures for compliance and safety

-- Create the waiver_signatures table
CREATE TABLE waiver_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Booking relationship fields
    slot_id TEXT NOT NULL,                    -- Links to booking slot
    payment_intent_id TEXT,                   -- Stripe payment intent ID
    booking_id TEXT,                          -- Final booking confirmation number (set after payment)
    
    -- Signer information
    signer_name TEXT NOT NULL,                -- Person who signed the waiver
    participant_name TEXT NOT NULL,           -- Person participating in lesson
    guardian_name TEXT,                       -- Guardian name if participant is minor
    is_minor BOOLEAN NOT NULL DEFAULT FALSE,  -- Age verification flag
    
    -- Contact information
    customer_email TEXT NOT NULL,             -- Email for identification
    customer_phone TEXT NOT NULL,             -- Phone for emergency contact
    emergency_contact_name TEXT NOT NULL,     -- Emergency contact information
    emergency_contact_phone TEXT NOT NULL,    -- Emergency contact phone
    
    -- Safety and medical information
    medical_conditions TEXT,                  -- Medical conditions/allergies
    
    -- Legal and audit information
    signed_at TIMESTAMPTZ NOT NULL,           -- When waiver was signed
    ip_address TEXT NOT NULL,                 -- IP address for legal compliance
    user_agent TEXT NOT NULL,                 -- Browser/device info for audit trail
    waiver_version TEXT NOT NULL DEFAULT 'v1.0', -- Track waiver changes over time
    
    -- Standard timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_waiver_signatures_payment_intent ON waiver_signatures(payment_intent_id);
CREATE INDEX idx_waiver_signatures_booking_id ON waiver_signatures(booking_id);
CREATE INDEX idx_waiver_signatures_slot_id ON waiver_signatures(slot_id);
CREATE INDEX idx_waiver_signatures_customer_email ON waiver_signatures(customer_email);
CREATE INDEX idx_waiver_signatures_signed_at ON waiver_signatures(signed_at);
CREATE INDEX idx_waiver_signatures_created_at ON waiver_signatures(created_at);

-- Add unique constraint to prevent duplicate signatures per payment
ALTER TABLE waiver_signatures 
ADD CONSTRAINT unique_payment_intent_waiver 
UNIQUE (payment_intent_id);

-- Enable Row Level Security
ALTER TABLE waiver_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role (admin) to perform all operations
CREATE POLICY "Service role has full access to waiver signatures"
ON waiver_signatures
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policy: Allow public to insert waiver signatures (during checkout)
CREATE POLICY "Allow public to insert waiver signatures"
ON waiver_signatures
FOR INSERT
TO public
WITH CHECK (true);

-- RLS Policy: Prevent public from reading, updating, or deleting
CREATE POLICY "Prevent public read access to waiver signatures"
ON waiver_signatures
FOR SELECT
TO public
USING (false);

CREATE POLICY "Prevent public update access to waiver signatures"
ON waiver_signatures
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Prevent public delete access to waiver signatures"
ON waiver_signatures
FOR DELETE
TO public
USING (false);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_waiver_signatures_updated_at
    BEFORE UPDATE ON waiver_signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE waiver_signatures IS 'Stores liability waiver signatures for legal compliance and safety tracking';
COMMENT ON COLUMN waiver_signatures.slot_id IS 'Reference to the booking slot ID';
COMMENT ON COLUMN waiver_signatures.payment_intent_id IS 'Stripe payment intent ID for verification';
COMMENT ON COLUMN waiver_signatures.booking_id IS 'Final booking confirmation number (set after successful payment)';
COMMENT ON COLUMN waiver_signatures.signer_name IS 'Full name of person who signed the waiver';
COMMENT ON COLUMN waiver_signatures.participant_name IS 'Full name of lesson participant';
COMMENT ON COLUMN waiver_signatures.guardian_name IS 'Guardian name if participant is under 18';
COMMENT ON COLUMN waiver_signatures.is_minor IS 'True if participant is under 18 years old';
COMMENT ON COLUMN waiver_signatures.emergency_contact_name IS 'Emergency contact person name';
COMMENT ON COLUMN waiver_signatures.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN waiver_signatures.medical_conditions IS 'Medical conditions, allergies, or concerns';
COMMENT ON COLUMN waiver_signatures.signed_at IS 'Timestamp when waiver was electronically signed';
COMMENT ON COLUMN waiver_signatures.ip_address IS 'IP address of signer for legal compliance';
COMMENT ON COLUMN waiver_signatures.user_agent IS 'Browser/device information for audit trail';
COMMENT ON COLUMN waiver_signatures.waiver_version IS 'Version of waiver terms (for tracking changes)';

-- Grant necessary permissions
GRANT ALL ON waiver_signatures TO service_role;
GRANT INSERT ON waiver_signatures TO anon;
GRANT INSERT ON waiver_signatures TO authenticated; 