-- Add missing UPDATE and DELETE RLS policies to subscriptions table

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own subscription"
  ON subscriptions FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
