-- RAWG search-result cache — same "shared across all users" pattern as game_metadata.
-- Search hits were the one uncached path: every import did a live RAWG call even
-- for a title another user had already imported. Caches the raw search response
-- per normalized query string, forever (no TTL, matching game_metadata's L2 pattern).

CREATE TABLE IF NOT EXISTS rawg_search_cache (
  query TEXT PRIMARY KEY,               -- normalized (lowercase, trimmed) search string
  results JSONB NOT NULL,               -- the compact result array we already return to clients
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rawg_search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rawg_search_cache public read"
  ON rawg_search_cache FOR SELECT
  USING (true);

-- Visibility-only counter for live RAWG API calls (not cache hits). No blocking,
-- no per-user gate — just lets us see monthly volume before it becomes a problem.
CREATE TABLE IF NOT EXISTS rawg_usage_log (
  month TEXT PRIMARY KEY,               -- 'YYYY-MM'
  live_calls INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rawg_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rawg_usage_log public read"
  ON rawg_usage_log FOR SELECT
  USING (true);
