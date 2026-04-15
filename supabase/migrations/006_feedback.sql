-- Feedback table: collects user-submitted feedback, bug reports, suggestions.
-- Email is optional; marketing_consent must be explicitly true to be eligible
-- for any future marketing list. Default false. No marketing flows exist yet —
-- this is forward-compatibility per legal-compliance rules (consent required
-- BEFORE any marketing email is ever sent).

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  email TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: writes only via service role (API route), no public reads
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_consent ON feedback (marketing_consent) WHERE marketing_consent = TRUE;
