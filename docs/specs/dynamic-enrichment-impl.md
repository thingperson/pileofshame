# Implementation Plan: Dynamic Game Data Enrichment

**Status:** Ready to build  
**Depends on:** `docs/specs/dynamic-enrichment.md` (the what)  
**Created:** 2026-05-15  

This doc covers the *how*. Read the parent spec for the *what* and *why*.

---

## 1. Architecture Decision: API Route (Server-Side, On-Demand)

**Recommendation: Next.js API route at `app/api/enrich-context/route.ts`, called on first game card expand.**

### Why this over the alternatives

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **API route on card open** | Only generates for games users actually look at; zero waste; simple request/response; matches existing patterns (RAWG, HLTB routes) | Adds ~1-2s latency on first open for uncached games | **Pick this** |
| Background job on import | Pre-generates everything; no first-open latency | Generates for games the user never looks at; 500-game import = 500 API calls = ~$0.25 wasted if user only opens 10; complicates import flow which is already slow | No |
| Supabase Edge Function | Could run on a schedule or trigger | Adds infrastructure complexity; no real advantage over API route for on-demand; harder to debug | No |

The API route approach matches every existing pattern in the codebase. `app/api/rawg/route.ts` and `app/api/hltb/route.ts` both follow the same shape: client requests data, API route checks cache (L1 in-memory, L2 Supabase), fetches from upstream if missing, caches the result, returns it. This is the same thing with Claude as the upstream.

The 1-2s latency on first open is acceptable because:
- It only happens once per game, ever (cached after that)
- The game card already has a loading state pattern from RAWG/HLTB enrichment
- A skeleton/shimmer on the tips section while loading is fine UX
- Every subsequent user who opens the same game gets instant cached data

---

## 2. Data Flow

```
User opens game card
        |
        v
Client: does game have `aiEnrichedAt` field?
        |
   yes--+--no
   |         |
   v         v
 Show    POST /api/enrich-context
cached   { name, genres, description, hltbMain, hltbComplete, moodTags }
data          |
              v
         API route checks Supabase `ai_game_context` table
              |
         hit--+--miss
         |         |
         v         v
       Return    Call Claude Haiku
       cached    (structured JSON output)
       data           |
                      v
                 Cache in Supabase `ai_game_context`
                 Set in-memory L1 cache
                      |
                      v
                 Return to client
                      |
                      v
              Client stores relevant fields
              in Zustand game object:
              - aiTips: string[]
              - aiPitch: string
              - aiMoodSuggestions: MoodTag[]
              - aiEnrichedAt: string
```

### Client-side storage

Add to the `Game` type in `lib/types.ts`:

```typescript
// AI-generated context (populated from /api/enrich-context, cached in Supabase)
aiTips?: string[];           // 3 game-specific "Jump Back In" tips
aiPitch?: string;            // "Worth it if..." one-liner for share cards
aiMoodSuggestions?: MoodTag[]; // Claude's mood tag suggestions (not auto-applied)
aiEnrichedAt?: string;       // ISO date of AI enrichment
```

These fields persist in localStorage with the rest of the game state. The `aiEnrichedAt` field is the cache key on the client side -- if it exists, don't re-fetch.

### Important: mood suggestions are *suggestions*, not overrides

Claude's mood tag corrections go into `aiMoodSuggestions`. They do NOT auto-replace the user's `moodTags`. This respects the locked decision that user agency is sacred (AGENTS.md #7). The UI can surface them as "Claude thinks this game is also [tag]" but the user decides whether to accept. MVP: just use them silently in the pick algorithm as a tiebreaker signal, don't surface the UI for accepting/rejecting yet.

---

## 3. Prompt Design

### Input (what we send to Claude)

Only public game metadata. No user data. No PII. No hours played (that's user data).

```typescript
interface EnrichContextRequest {
  name: string;          // "Hollow Knight"
  genres: string[];      // ["Action", "Adventure", "Indie"]
  description: string;   // RAWG synopsis (max 300 chars, already truncated)
  hltbMain?: number;     // 26.5 (hours)
  hltbComplete?: number; // 63 (hours)
  currentMoodTags: string[]; // ["atmospheric", "intense"]
}
```

### System prompt

```
You are a gaming advisor for Inventory Full, an app that helps people decide what to play from their existing game library. Generate context data for games.

Rules:
- Tips must be specific to THIS game's actual mechanics, not generic advice
- Never say "check your quest log" unless this game literally has a quest log
- The "worth it if" pitch should help someone decide whether to START this game
- Mood tags should reflect how the game FEELS to play, not its marketing genre
- Keep tips warm and practical. You're helping someone jump back into a game they stepped away from.
- No spoilers past the first 20% of the game
- Return valid JSON only, no markdown
```

### User prompt

```
Game: {name}
Genres: {genres.join(", ")}
Description: {description}
HLTB main story: {hltbMain}h | Completionist: {hltbComplete}h
Current mood tags: {currentMoodTags.join(", ")}

Generate JSON:
{
  "tips": ["tip1", "tip2", "tip3"],
  "pitch": "Worth it if you like...",
  "moodTags": ["tag1", "tag2"]
}

Tips: 3 specific "Jump Back In" tips for someone returning to this game. Reference actual game mechanics, menus, or systems. Each tip starts with an emoji.

Pitch: One sentence, starts with "Worth it if". Should help someone decide whether to commit 20+ hours.

Mood tags: Confirm or correct the current tags. Valid tags: chill, intense, story-rich, brainless, atmospheric, competitive, spooky, creative, strategic, emotional. Max 3.
```

### Model selection

**Claude 3.5 Haiku** (`claude-3-5-haiku-latest`). Reasons:
- Structured JSON output is well within Haiku's capabilities
- Game knowledge is broad enough for this task (popular games are heavily represented in training data)
- Cost is ~10x cheaper than Sonnet for the same task
- Latency is ~2x faster than Sonnet

If quality proves insufficient for niche/obscure games, we can tier up to Sonnet selectively (e.g., if the game has no RAWG description, indicating it's obscure, use Sonnet).

### Prompt caching opportunity

The system prompt is identical across all calls. With Anthropic's prompt caching, after the first call the system prompt is cached for 5 minutes, reducing input token cost by ~90% for the cached portion. During an import where a user opens multiple game cards in sequence, this saves meaningfully.

To enable: set `cache_control: { type: "ephemeral" }` on the system message content block.

---

## 4. Caching Strategy

### Supabase table: `ai_game_context`

New migration: `009_ai_game_context.sql`

```sql
CREATE TABLE IF NOT EXISTS ai_game_context (
  -- Composite key: game identity is name + genre combo
  -- (same game name with different genres = different game edition)
  cache_key TEXT PRIMARY KEY,  -- lowercase(name) or rawg_slug
  name TEXT NOT NULL,
  tips JSONB NOT NULL,         -- ["tip1", "tip2", "tip3"]
  pitch TEXT NOT NULL,         -- "Worth it if..."
  mood_tags TEXT[] NOT NULL,   -- ["atmospheric", "intense"]
  model TEXT NOT NULL,         -- "claude-3-5-haiku-latest"
  prompt_version INTEGER NOT NULL DEFAULT 1,  -- bump when prompt changes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS -- this is public game context data, same as game_metadata
-- Service role writes, anon reads
ALTER TABLE ai_game_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI game context"
  ON ai_game_context FOR SELECT
  USING (true);
```

### Cache key strategy

Use the RAWG slug if available (most reliable identifier), otherwise `lowercase(normalized_game_name)`. The normalization function already exists in `lib/enrichGame.ts` as `normalizeGameName()`.

### Cache invalidation

Games don't change. Cache forever. The `prompt_version` column lets us selectively regenerate when we improve the prompt -- a future migration can `DELETE FROM ai_game_context WHERE prompt_version < 2` to force regeneration.

### L1 in-memory cache

Same pattern as RAWG route: `Map<string, { data, ts }>` with 1-hour TTL and 500-entry cap. Prevents redundant Supabase reads for the same game within a server instance's lifetime.

---

## 5. Cost Model

### Per-game cost

- System prompt: ~150 tokens (cached after first call)
- User prompt: ~200 tokens per game
- Response: ~150 tokens per game
- Total per game: ~350 tokens input + ~150 tokens output

At Claude 3.5 Haiku rates (as of May 2026):
- Input: $0.80 / MTok
- Output: $4.00 / MTok
- With prompt caching (90% of system prompt cached): ~$0.0004 per game

### Projections

| DAU | Unique games/day (est.) | Monthly new games | Monthly cost |
|---|---|---|---|
| 100 | 50 | ~500 | ~$0.20 |
| 500 | 150 | ~2,000 | ~$0.80 |
| 2,000 | 400 | ~5,000 | ~$2.00 |
| 10,000 | 1,000 | ~10,000 | ~$4.00 |

**Key insight:** Cost scales with *unique games*, not with users. Once a game is cached, every subsequent user gets it free. The Steam/PSN/Xbox game catalog is large but finite -- after the first few thousand users, cache hit rate approaches 90%+ and new-game generation drops dramatically.

At 2,000 DAU, we're looking at ~$2/month. This is negligible.

### Cost controls

- Per-IP rate limit: 10 enrichment calls per minute (matches card-opening pace)
- Per-server rate limit: 100 calls per minute to Anthropic API (circuit breaker)
- Monthly budget alert at $10 (via Anthropic dashboard)
- If cost exceeds $20/month, investigate -- probably a bug or abuse

---

## 6. Error Handling

### Claude API down or rate limited

```typescript
// Fallback chain:
// 1. Check Supabase cache (might have been generated by another server instance)
// 2. If no cache, return null -- client falls back to existing tips
// 3. Log to Sentry with tag { route: 'enrich-context', error: 'api_unavailable' }
// 4. Set a 5-minute cooldown before retrying for this game
```

The client already has a complete fallback chain:
1. Verified re-entry packs (`lib/reentryPacks.ts`) -- 1 game with milestone-aware tips
2. Game-specific hardcoded tips (`GameCard.tsx` GAME_SPECIFIC_TIPS) -- 24 games
3. Genre-based fallback tips (`GameCard.tsx` getGenreTips) -- 13 genre patterns

If AI enrichment fails, the user gets the existing tip experience. No degradation in core functionality.

### Malformed JSON response

Use `JSON.parse` with a try/catch. If Claude returns invalid JSON:
- Retry once with a more explicit prompt ("Return ONLY valid JSON, no other text")
- If retry fails, return null and fall back to existing tips
- Log to Sentry

### Timeout

Set a 10-second timeout on the Claude API call. Haiku typically responds in 1-3 seconds; 10 seconds is generous. If it times out, fall back.

---

## 7. Privacy Considerations

### What leaves the client

Only public game metadata:
- Game name (public, from RAWG)
- Genres (public, from RAWG)
- Description (public, from RAWG)
- HLTB times (public, from HLTB)
- Current mood tags (inferred from genres, not user input)

### What does NOT leave the client

- User's hours played
- User's game status (Backlog, Playing, etc.)
- User's library composition
- Any user identifiers (no user ID, no IP forwarded to Claude)
- Achievement/trophy data
- Platform account tokens

### Privacy Policy update required?

**Borderline no, but update anyway to be safe.**

The data sent to Claude is the same category as what we already send to RAWG and HLTB (game names and metadata). Our Privacy Policy already covers third-party API calls for game enrichment. However, adding a new third-party service (Anthropic) should be disclosed.

Update `app/privacy/page.tsx`:
- Add Anthropic to the list of third-party services used for game metadata enrichment
- Clarify that only public game information (names, genres, descriptions) is sent
- State that no user data or personally identifiable information is sent to AI services

This update should ship WITH the feature, per `legal-compliance.md`.

---

## 8. Implementation Steps

### Phase 1: Foundation (est. 2-3 hours)

1. **Install Anthropic SDK**
   - `npm install @anthropic-ai/sdk`
   - Add `ANTHROPIC_API_KEY` to `.env.local` and Vercel env vars
   - Effort: 10 min

2. **Create Supabase migration `009_ai_game_context.sql`**
   - Table schema as described in section 4
   - Run migration against Supabase
   - Effort: 15 min

3. **Create API route `app/api/enrich-context/route.ts`**
   - POST endpoint accepting game metadata
   - L1 in-memory cache + L2 Supabase cache
   - Claude Haiku call with prompt caching
   - Rate limiting (reuse existing `lib/rateLimit.ts`)
   - Sentry error tracking
   - Effort: 1-2 hours

4. **Add AI fields to `Game` type in `lib/types.ts`**
   - `aiTips`, `aiPitch`, `aiMoodSuggestions`, `aiEnrichedAt`
   - Effort: 10 min

### Phase 2: Client Integration (est. 2-3 hours)

5. **Create `lib/aiEnrich.ts` client helper**
   - `fetchAIContext(game: Game): Promise<AIContext | null>`
   - Checks `aiEnrichedAt` before calling
   - Calls `/api/enrich-context`
   - Returns typed result
   - Effort: 30 min

6. **Integrate into GameCard.tsx**
   - On game card expand (not on render -- only when user opens details)
   - Show shimmer/skeleton while loading
   - Replace genre tips with AI tips when available
   - Fallback chain: AI tips > verified re-entry pack > game-specific > genre
   - Effort: 1-2 hours

7. **Wire up store updates**
   - When AI context returns, call `updateGame(id, { aiTips, aiPitch, aiMoodSuggestions, aiEnrichedAt })`
   - These persist in localStorage so subsequent card opens are instant
   - Effort: 30 min

### Phase 3: Polish & Privacy (est. 1 hour)

8. **Update Privacy Policy**
   - Add Anthropic disclosure to `app/privacy/page.tsx`
   - Update "Last updated" date
   - Effort: 20 min

9. **Add loading/error states**
   - Shimmer state while fetching
   - Graceful fallback on error (no visible error to user, just existing tips)
   - Effort: 30 min

10. **Test manually**
    - Test with cached game (should be instant)
    - Test with uncached game (should load in 1-3s)
    - Test with API key missing (should fall back gracefully)
    - Test with obscure game (check quality of tips)
    - Effort: 30 min

### Phase 4: Future (not in MVP)

- Surface `aiPitch` on share cards ("Worth it if..." copy)
- Surface `aiMoodSuggestions` as a "Claude thinks..." prompt for mood correction
- Use AI tips in the pick result card alongside Smart Pick headlines
- Batch pre-generation for games in "Playing Now" status (small set, high value)
- Prompt v2 based on quality observations

---

## 9. MVP Scope: The Smallest Useful Version

**Ship this first:**

1. API route + Supabase cache table
2. AI tips replacing genre fallback tips on game card expand
3. Privacy Policy update
4. Graceful fallback when Claude is unavailable

**Do NOT include in MVP:**

- Share card "worth it if" integration (Phase 4)
- Mood tag suggestion UI (Phase 4)
- Batch pre-generation (Phase 4)
- "Where you probably are" orientation (requires hours played, which is user data -- revisit the privacy implications separately)

The MVP proves the approach: user opens a game card, sees 3 tips that are actually specific to that game's mechanics instead of generic genre advice. That's the "is this worth it?" test. If the tips for Hollow Knight say "Buy the map from Cornifer" instead of "Check the map for unexplored rooms," we've validated the approach.

---

## SDK Usage Notes

### Anthropic SDK setup

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### API call with prompt caching

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-latest',
  max_tokens: 300,
  system: [{
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
  }],
  messages: [{
    role: 'user',
    content: buildUserPrompt(gameData),
  }],
});

// Extract text from response
const text = response.content[0].type === 'text' 
  ? response.content[0].text 
  : '';
const parsed = JSON.parse(text);
```

### Response validation

```typescript
interface AIGameContext {
  tips: [string, string, string];
  pitch: string;
  moodTags: MoodTag[];
}

function validateResponse(parsed: unknown): AIGameContext | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  
  if (!Array.isArray(obj.tips) || obj.tips.length < 3) return null;
  if (typeof obj.pitch !== 'string' || !obj.pitch.startsWith('Worth it if')) return null;
  if (!Array.isArray(obj.moodTags)) return null;
  
  // Validate mood tags against allowed list
  const validMoods: MoodTag[] = ['chill', 'intense', 'story-rich', 'brainless', 
    'atmospheric', 'competitive', 'spooky', 'creative', 'strategic', 'emotional'];
  const filteredMoods = (obj.moodTags as string[])
    .filter(t => validMoods.includes(t as MoodTag)) as MoodTag[];
  
  return {
    tips: obj.tips.slice(0, 3) as [string, string, string],
    pitch: obj.pitch as string,
    moodTags: filteredMoods.slice(0, 3),
  };
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Claude returns bad tips for obscure games | Medium | Low (fallback exists) | Log quality issues; consider Sonnet for games with no RAWG description |
| Anthropic API outage | Low | None (graceful fallback) | Existing tip chain covers 100% of games |
| Cost spike from abuse | Low | Low ($20 cap) | Rate limiting + monthly budget alert |
| Prompt injection via game names | Very low | Low (output is cached, not executed) | Validate JSON output; sanitize game names in prompt |
| localStorage bloat from AI fields | Low | Medium | ~200 bytes per game; 500 games = 100KB; negligible vs cover URLs |

---

*This plan is ready to build. The MVP is ~5-6 hours of focused work. The hardest part is the GameCard integration (step 6) because GameCard.tsx is ~1000 lines and needs surgical edits.*
