-- ============================================
-- The Curator — Subscriptions Table
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL UNIQUE,
  plan              text NOT NULL DEFAULT 'free',
  paypal_payer_id   text,
  paypal_capture_id text,
  usage_count       int NOT NULL DEFAULT 0,
  usage_reset_at    timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  created_at        timestamptz DEFAULT now()
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: users can only view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
