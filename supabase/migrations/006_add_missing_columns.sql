-- ============================================
-- Add missing columns used by the application
-- ============================================

-- 1. Contracts table: temporary storage & error tracking columns
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_text  TEXT DEFAULT NULL;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS pdf_base64     TEXT DEFAULT NULL;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS error_message  TEXT DEFAULT NULL;

-- 2. Subscriptions table: Paddle billing columns
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT DEFAULT NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_customer_id     TEXT DEFAULT NULL;

-- 3. Index for fast webhook lookups by Paddle subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_sub_id
  ON subscriptions (paddle_subscription_id);

-- 4. Drop stale PayPal columns (migrated to Paddle)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS paypal_payer_id;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS paypal_capture_id;

-- 5. INSERT RLS policy for subscriptions (safe re-run with DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions'
      AND policyname = 'Users can insert their own subscription'
  ) THEN
    CREATE POLICY "Users can insert their own subscription"
      ON subscriptions FOR INSERT
      WITH CHECK (auth.uid()::text = user_id);
  END IF;
END
$$;
