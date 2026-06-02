-- ============================================
-- Add updated_at to contracts for stuck-analysis recovery
-- ============================================
-- Lets the process route detect a PROCESSING contract whose serverless
-- function died (Vercel timeout / redeploy / crash) and re-claim it.

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill existing rows so old records aren't treated as "just updated"
UPDATE contracts SET updated_at = created_at WHERE updated_at IS NULL;
