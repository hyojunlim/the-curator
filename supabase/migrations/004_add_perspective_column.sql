-- Add perspective column to contracts table
-- Stores which party's perspective was used for analysis: 'party_a' or 'party_b'
-- NULL means neutral / no specific perspective
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS perspective TEXT DEFAULT NULL;
