-- ============================================
-- Persist the chosen output language on each contract
-- ============================================
-- Needed so a stuck analysis can be re-processed in the ORIGINAL language.
-- Before this, language lived only in result.language (null until complete),
-- so recovery/retry guessed the language and could return the wrong one.

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'English';
