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

-- No RLS — this is public game data, not user data
-- Any authenticated or anon user can read; only service role can write
-- (writes happen from API routes using the service role key)
