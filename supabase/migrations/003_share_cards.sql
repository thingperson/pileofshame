-- Share cards: user-composed completion share cards with unique short IDs
-- Public read (OG image fetcher needs access), authenticated write only
-- Short ID is 8-char nanoid-style for clean URLs: inventoryfull.gg/clear/a1b2c3d4

CREATE TABLE IF NOT EXISTS share_cards (
  id TEXT PRIMARY KEY,                    -- 8-char short ID
  game_name TEXT NOT NULL,
  cover_url TEXT,
  rating INTEGER,                         -- 1-5 stars (0 = not rated)

  -- Composable data points (all optional, user picks what to show)
  hours_played REAL,
  hltb_main REAL,                         -- for "X hours faster/slower than average"
  time_in_pile_days INTEGER,              -- days between addedAt and completedAt
  dollar_value REAL,                      -- retail price of the game
  total_cleared INTEGER,                  -- user's total cleared count at time of share
  backlog_remaining INTEGER,              -- user's remaining backlog size
  total_reclaimed REAL,                   -- cumulative dollar value reclaimed

  -- Display preferences (which elements the user chose to show)
  show_hours BOOLEAN NOT NULL DEFAULT false,
  show_hltb_compare BOOLEAN NOT NULL DEFAULT false,
  show_pile_time BOOLEAN NOT NULL DEFAULT false,
  show_dollar_value BOOLEAN NOT NULL DEFAULT false,
  show_stats BOOLEAN NOT NULL DEFAULT false,
  show_display_name BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT,                      -- opt-in only

  -- Flavor text (randomly assigned on creation, frozen in card)
  flavor_text TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS: public reads for OG image fetching, writes go through service role API
ALTER TABLE share_cards ENABLE ROW LEVEL SECURITY;

-- Anyone can read (OG image route, landing page)
CREATE POLICY "Share cards are publicly readable"
  ON share_cards FOR SELECT
  USING (true);

-- Only service role can insert (API route validates and creates)
-- No user-facing writes directly to this table
