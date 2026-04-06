-- Atomic increment function to prevent race conditions on usage_count
-- This prevents concurrent requests from bypassing the monthly usage limit.

CREATE OR REPLACE FUNCTION increment_usage(p_user_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET usage_count = usage_count + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
