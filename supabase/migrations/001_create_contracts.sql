-- ============================================
-- The Curator — Contracts Table
-- ============================================

CREATE TABLE IF NOT EXISTS contracts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  title       text NOT NULL DEFAULT 'Untitled',
  parties     text DEFAULT '',
  type        text DEFAULT 'Service',
  status      text DEFAULT 'COMPLETE',
  risk_score  int NOT NULL DEFAULT 0,
  risk_high   boolean NOT NULL DEFAULT false,
  result      jsonb,
  starred     boolean NOT NULL DEFAULT false,
  tags        text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts (user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts (created_at DESC);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own contracts
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own contracts"
  ON contracts FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own contracts"
  ON contracts FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
