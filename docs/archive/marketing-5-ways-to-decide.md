# Marketing Hook: 5 Ways to Pick Tonight's Game

**Captured:** Apr 15, 2026 from a Cowork audit note
**Status:** Marketing angle. Not a product change — a framing Brady should lean on.

---

## The insight

The 5 reroll shortcut modes are a retention hook that was undercounted in early product framing. They give repeat visitors a fast "vibe" entry point without going through the full mood-and-time picker. Low-friction re-engagement.

For marketing copy, **"5 ways to pick tonight's game"** is sharper, more specific, and more tweet-sized than the broader hero pitch. It's the kind of hook that performs well on Reddit gaming subs and as a ProductHunt one-liner.

## The 5 modes (verbatim)

```
🎲  Anything       — Random from all games
🌙  Quick Session  — Wind-down tier only
🔥  Deep Cut       — A game buried in your backlog
▶   Keep Playing   — Games you already started
🏁  Almost Done    — Games you're close to finishing
```

## Why this works as marketing

- **Concrete.** "Mood matching" is abstract. "A game buried in your backlog" is a feeling.
- **Self-qualifying.** Someone reading this list finds themselves in at least one of these modes. That's a match moment.
- **Shareable.** The format maps to threads, listicles, tweets. One-line pitch per mode.
- **Not a feature list.** It's a set of *states the user is already in.* Every gamer recognizes themselves somewhere.

## Suggested surfaces

### 1. Landing page section
Replace the top 3 function-focused feature cards (Mood matching / Time-aware / Completion celebrations) with a "5 ways to pick tonight's game" grid. Each card = one mode, with the emoji, the label, and a one-line elaboration. See `docs/landing-pr-preview-2026-04-15.md` item #4 for the proposed implementation.

### 2. Reddit / social posts
Lead format for r/patientgamers, r/gamingsuggestions, r/Steam:

> Built a tool that picks your next game from your own library. 5 modes:
> 🎲 Anything — pure random
> 🌙 Quick Session — wind-down only
> 🔥 Deep Cut — something buried you forgot about
> ▶ Keep Playing — games you already started
> 🏁 Almost Done — close to credits
>
> Free, no account. inventoryfull.gg

Short. Specific. Not selling. Reads like a friend describing a tool.

### 3. ProductHunt tagline options
- "Pick tonight's game from your own library. 5 modes, 10 seconds."
- "Your backlog has 300 games. We have 5 ways to pick one."
- "Stop scrolling your library. 5 ways to pick what to play tonight."

### 4. Twitter / Bluesky / Mastodon one-liner
> 300 games in your library. 5 ways to pick one. inventoryfull.gg

### 5. Screenshots / share cards
The mode-selector UI itself is a strong screenshot. Clean grid of 5 icons + labels = instantly legible, no app context needed. Good for any social preview.

## Expansion ideas (deferred)

- One blog-post per mode ("Deep Cut: a defense of playing something buried in your backlog"). 5 posts = 5 weeks of content.
- "Which mode are you tonight?" poll on social. High engagement pattern.
- Year-in-review stat: "You used Deep Cut 12 times this year. Longest nostalgia run on record."

## Copy guardrails (reminder)

These modes already have locked labels and icons in `lib/reroll.ts`. Don't rename them for marketing without updating the product. Consistency > cleverness.

If a mode ever gets renamed in-product, this doc should update in the same PR.
