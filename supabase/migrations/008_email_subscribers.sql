-- Email subscribers: collects opt-in emails from unauthenticated visitors who
-- want product updates (e.g., from a landing-page capture form). Separate from
-- auth.users + profiles.wants_updates because:
--   1) These users have no Supabase auth account.
--   2) Conflating "tried the app" with "wants emails" violates legal-compliance.md
--      (consent must be explicit and source-attributable).
-- Per legal-compliance: marketing_consent is implicit-true here because the row
-- only exists if the user explicitly submitted a "subscribe" form. Source field
-- is required so we can attribute where consent was given.

-- Email is stored lowercased (normalized at the API layer) so a column-level
-- UNIQUE constraint enforces case-insensitive uniqueness AND is usable as the
-- ON CONFLICT target for upserts. Expression indexes can't be used as upsert
-- targets via PostgREST.
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  user_agent TEXT,
  page_url TEXT,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_active
  ON email_subscribers (consented_at DESC)
  WHERE unsubscribed_at IS NULL;

-- RLS: writes only via service role (API route), no public reads.
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
