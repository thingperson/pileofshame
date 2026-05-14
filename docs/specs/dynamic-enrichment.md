# Spec: Dynamic Game Data Enrichment

**Status:** Specced, not built  
**Priority:** High — this is load-bearing for Jump Back In tips, mood accuracy, and share card "worth it if X" copy  
**Created:** 2026-05-14  
**Origin:** Recurring conversation topic that never got documented as a buildable spec. Brady raised it multiple times across sessions. This doc exists so it doesn't evaporate again.

---

## Problem

When a user imports a library, we enrich games with RAWG metadata and HLTB times. But that gives us genre, description, scores, and completion estimates. It doesn't give us:

- **Jump Back In tips** that are actually game-aware (current fallback is genre-based and sometimes wrong — e.g., "open the map" for a linear speedrunner)
- **Mood tag accuracy** for games outside the 344 curated entries and 52 hand-tuned overrides
- **One-liner recommendations** for share cards ("worth it if you like X")
- **Game-specific context** that helps the user decide whether to start or resume

We currently have three tiers of tips: 1 verified milestone pack (Clair Obscur), 24 game-specific hardcoded fallbacks, 13 genre fallbacks. That's not scalable. Users will import games we've never seen.

## Proposal

When a user opens a game card for a game that has no enriched tips/context, dynamically generate that data using the Claude API, then cache it in Supabase for future use.

### What gets generated

Per game, on first view:

1. **Jump Back In tips** (3 tips, game-aware, genre-appropriate)
2. **"Where you probably are" orientation** (based on hours played + game structure)
3. **One-liner pitch** ("worth it if X" — for share cards)
4. **Mood tag validation** (confirm or correct auto-inferred mood tags)

### How it works

1. User opens a game card for a game with no cached enrichment
2. Client fires a request to an API route (e.g., `/api/enrich-context`)
3. API route calls Claude with: game name, genres, HLTB data, user's hours played, description
4. Claude returns structured JSON: tips, orientation, pitch, mood validation
5. API route caches the result in Supabase (keyed by game name + normalized identifier)
6. Next user who opens the same game gets the cached version instantly

### Prompt shape (rough)

```
Given this game:
- Name: {name}
- Genres: {genres}
- HLTB main: {hltbMain}h, completionist: {hltbComplete}h
- Description: {description}

Generate:
1. Three "Jump Back In" tips specific to this game's mechanics and structure. No generic advice like "check your quest log" unless this game literally has a quest log. Be specific to how this game actually plays.
2. A one-sentence "worth it if..." recommendation (e.g., "Worth it if you like slow-burn detective work with no hand-holding").
3. Confirm or suggest corrections to these mood tags: {currentMoodTags}

Return as JSON.
```

### Cost estimate

- Claude Haiku for this (fast, cheap, good enough for structured data)
- ~500 tokens per game (prompt + response)
- At Haiku rates: ~$0.0005 per game
- 500 unique games = ~$0.25 total
- Cache means each game is generated once, ever

### Privacy

- No user data sent to Claude — only game metadata (name, genres, HLTB, description)
- All public information, no PII
- Consistent with current privacy policy (game metadata from third-party APIs)

### What this unblocks

- Jump Back In tips that aren't embarrassing
- Share card Phase 2 ("worth it if X" on completion cards)
- Better mood accuracy for the long tail of games outside our curated lists
- Eventually: per-game "how to get back into this" for returning players

## Open questions

1. **Generate on card open or on import?** Card open is lazier (only generates when needed) but adds latency. Import-time is eager but generates for games the user might never look at. Recommend: card open with a loading state.
2. **Haiku or Sonnet?** Haiku is probably sufficient for structured game data. Test both.
3. **Cache invalidation?** Games don't change. Cache forever unless we want to regenerate with a better prompt later.
4. **Rate limiting?** If someone imports 500 games and opens them all, that's 500 API calls. Probably fine at Haiku rates but should have a per-user rate limit.

## Not in scope

- Generating game descriptions (RAWG handles this)
- Generating cover art or screenshots
- User-specific tips based on playstyle (we can't know playstyle)
- Replacing the hand-tuned mood overrides or curated moods (those stay as the highest-priority tier)

---

*This spec exists because the idea came up in conversation multiple times, was agreed on as smart, and never got written down in a way that survived session boundaries. If you're reading this and it still hasn't been built, that's the problem this doc is trying to solve.*
