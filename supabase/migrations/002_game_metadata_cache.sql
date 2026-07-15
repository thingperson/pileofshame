-- Game metadata cache — shared across all users
-- Stores RAWG + HLTB enrichment data so we stop hammering free-tier APIs.
-- Public table (no RLS needed) — game metadata is not user data.

CREATE TABLE IF NOT EXISTS game_metadata (
  slug TEXT PRIMARY KEY,                -- RAWG slug (unique game identifier)
  name TEXT NOT NULL,
  cover_url TEXT,
  metacritic INTEGER,
  genres TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  released TEXT,
  rating REAL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  hltb_main REAL,                       -- Hours to beat (main story)
  hltb_extra REAL,                      -- Hours to beat (main + extras)
  hltb_completionist REAL,              -- Hours to 100%
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for name search (used by enrichment lookups)
CREATE INDEX IF NOT EXISTS idx_game_metadata_name ON game_metadata USING gin (to_tsvector('english', name));

-- RLS: this is public game data, not user data.
-- Enable RLS (Supabase best practice / clears the security advisor) and allow
-- public read. Writes have NO policy, so only the service role (which bypasses
-- RLS) can write — that's the /api/rawg route using SUPABASE_SERVICE_ROLE_KEY.
-- Anon/authenticated clients can read but never write.
ALTER TABLE game_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_metadata public read"
  ON game_metadata FOR SELECT
  USING (true);
