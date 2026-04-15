-- App-wide metadata: single-row table for cross-cron state.
-- Currently used by the milestone-check cron to remember which milestones
-- have already been notified, so we don't spam ntfy on every run.

CREATE TABLE IF NOT EXISTS app_meta (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_user_milestone INTEGER NOT NULL DEFAULT 0,
  last_share_milestone INTEGER NOT NULL DEFAULT 0,
  last_feedback_pinged_id UUID,
  last_feedback_count INTEGER NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_meta_singleton CHECK (id = 1)
);

-- If table already existed (pre-migration), add new columns.
ALTER TABLE app_meta ADD COLUMN IF NOT EXISTS last_feedback_pinged_id UUID;
ALTER TABLE app_meta ADD COLUMN IF NOT EXISTS last_feedback_count INTEGER NOT NULL DEFAULT 0;

INSERT INTO app_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- No RLS needed: writes only happen via service role from cron route.
ALTER TABLE app_meta ENABLE ROW LEVEL SECURITY;
