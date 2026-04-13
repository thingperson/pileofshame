-- Stats share cards: user-composed library stats cards with unique short IDs
-- Public read (OG image fetcher needs access), authenticated write only
-- Short ID is 8-char nanoid-style for clean URLs: inventoryfull.gg/pile/a1b2c3d4

CREATE TABLE IF NOT EXISTS share_stats (
  id TEXT PRIMARY KEY,                    -- 8-char short ID

  -- Core stats (always present)
  games_cleared INTEGER NOT NULL DEFAULT 0,
  games_in_motion INTEGER NOT NULL DEFAULT 0,
  backlog_size INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  hours_logged REAL NOT NULL DEFAULT 0,
  exploration_pct INTEGER NOT NULL DEFAULT 0,
  lines_drawn INTEGER NOT NULL DEFAULT 0,

  -- Archetype
  archetype_name TEXT,
  archetype_descriptor TEXT,

  -- Value calculator data
  unplayed_value INTEGER,
  played_value INTEGER,
  backlog_hours INTEGER,

  -- Trophy case data
  trophies_earned INTEGER,
  trophies_total INTEGER,
  platinums INTEGER,
  perfect_games INTEGER,
  gamerscore INTEGER,

  -- Display preferences (which sections the user chose to show)
  show_value BOOLEAN NOT NULL DEFAULT false,
  show_archetype BOOLEAN NOT NULL DEFAULT false,
  show_trophies BOOLEAN NOT NULL DEFAULT false,
  show_hours BOOLEAN NOT NULL DEFAULT false,
  show_display_name BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT,

  -- Flavor text (randomly assigned on creation, frozen in card)
  flavor_text TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS: public reads for OG image fetching, writes go through service role API
ALTER TABLE share_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read (OG image route, landing page)
CREATE POLICY "Stats cards are publicly readable"
  ON share_stats FOR SELECT
  USING (true);

-- Only service role can insert (API route validates and creates)
-- No user-facing writes directly to this table
