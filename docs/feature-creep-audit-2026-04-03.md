# Feature Creep Audit — April 3, 2026

> **HISTORICAL — several verdicts overridden (2026-04-20).** Keep this doc as a methodology reference, but do not act on the calls below that were later reversed:
>
> - **Archetypes: verdict "keep 1, remove reroll" is REVERSED.** Archetypes are intentional personality, not bloat. Reroll lets users cycle through the multiple archetypes that apply to them. Share card is parked pending per-archetype art, not abandoned.
> - **Themes: verdict "trim 9 → 5" is REVERSED.** Themes are tested, no maintenance-burden signal has surfaced. Theme count is now 13.
> - **Share composer consolidation**: still valid, low priority.
>
> See `docs/doc-audit-2026-04-20.md` for the full override context.

## Core Loop Reminder
**Import → Tell us your mood → We find your game → Play → Celebrate**

---

## Surface Area Count

| Metric | Count | Concern Level |
|--------|-------|---------------|
| Buttons above fold (mobile) | 13 | 🟡 High — should be 8-9 |
| Modal/panel types | 12 | 🟡 Watch |
| Settings options | ~8 | ✅ OK |
| Import sources | 5 (Steam, PSN, Xbox, GOG/Playnite, CSV) | ✅ OK |
| Share destinations | 3 (Twitter, Reddit, Discord) × 3 composers | 🟡 Redundant |
| Visual themes | 9 | 🟡 Maintenance burden |

---

## Healthy (Core, Well-Integrated)

These features directly serve the core loop and should stay:

- **Import Hub** (Steam, PSN, Xbox, CSV, Playnite) — Import step
- **Auto-Enrichment** (RAWG + HLTB on import) — Zero-effort enrichment
- **Reroll / "Get Playing"** with mode buttons — Discovery/mood step
- **Status cycle** (tap to advance) — Play step
- **Completion Celebration** (confetti, rating, stats) — Celebrate step
- **Up Next / Now Playing section** — Play step
- **Grid + List view toggle** — Browse step
- **Filter bar** (search, mood, session length) — Discovery step
- **Cloud sync** (Supabase) — Retention
- **Game detail modal** (grid view) — Browse step
- **Toast system** — Feedback loop
- **Just 5 Minutes** — Discovery/play step (clever decision-forcing)

## Watch List (Fine Now, Could Bloat)

- **StatsPanel** — serves retention/sharing but getting complex. Multiple sub-features (shame calculator, HLTB time, share buttons, archetype). Could become its own page.
- **Themes (9 total)** — fun, delightful, but 9 themes = 9× maintenance cost. Each new feature needs testing across all themes. Consider trimming to 5 (Dark, Light, Synthwave, Dino, Ultra).
- **Deal badges** — good for affiliate future but CheapShark data is spotty. Don't invest more here until affiliate revenue is real.
- **Search-to-Add** — clever feature, low cost, fine. But don't expand into full RAWG autocomplete until proven people want it.
- **Onboarding flow** — just simplified to single screen. Good. Don't add steps back.

## Candidates for Simplification

### 1. Three Duplicate Share Composers
**Problem**: StatsPanel has share buttons, ClearedSection (Hall of Fame) has share buttons, ShareCard has share buttons. Three separate share implementations with overlapping content.
**Recommendation**: Consolidate to one share composer that adapts based on context. Single component, multiple entry points.

### 2. Header Button Row (13 buttons mobile)
**Problem**: Get Playing, Quick Session, Deep Cut, Keep Playing, Just 5 Min, Import, Add Game, View Toggle, Stats, Settings, Help, Sync, Theme. That's a lot of buttons competing for attention above the actual games.
**Recommendation**:
- Move Help into Settings (it's a modal anyway)
- Theme picker into Settings
- Collapse Quick Session / Deep Cut / Keep Playing into the Reroll modal (they're reroll modes, not standalone actions)
- Target: 8-9 buttons max above fold

### 3. Shame Dollar Calculator
**Problem**: Background enrichment, progressive caching, confidence bars. Complex subsystem for a fun stat that users see once.
**Recommendation**: Keep the number, simplify the calculation. Show a rough estimate immediately, don't run background enrichment pipelines for it. Move to a /stats page if we build one.

### 4. HLTB Time-to-Clear
**Problem**: Same as above — background enrichment pipeline for a single stat.
**Recommendation**: Same treatment. Rough estimate, don't over-engineer.

## Candidates for Removal

### 1. Player Archetype System (15+ types)
**Concern**: Fun to build, fun to read once. But 15+ archetypes with re-roll is a mini-game inside a tool that should get people OUT of the app. Does it help anyone play a game tonight?
**Verdict**: Keep 1 archetype (the primary one). Remove re-roll. Simplify to "here's your type" not "here's a personality quiz."

### 2. ShareCard Image Export (/api/share-card)
**Concern**: Server-side PNG generation with 5 themed templates. Complex, maintenance-heavy. How many users actually download a PNG share card vs. just copying text?
**Verdict**: Watch usage. If <5% of users use it, cut it. Text sharing is simpler and works everywhere.

### 3. 90s Mode Chrome (banners, footers, cursor trails)
**Concern**: Each theme chrome piece adds JS, CSS, and maintenance. 90s mode is the heaviest with visitor counters, marquee banners, cursor trails.
**Verdict**: Keep the theme colors/styling. Consider removing the heavy chrome elements (cursor trails, animated banners) that add bundle size.

---

## Recommendations

### Do Now (Low Effort, High Impact)
1. **Collapse reroll mode shortcuts into Reroll modal** — removes 3 buttons from header
2. **Move Help into Settings** — removes 1 button
3. **Move Theme picker into Settings** — removes 1 button (if exposed)

### Do Soon (Medium Effort)
4. **Consolidate share composers** — one component, multiple entry points
5. **Trim themes from 9 to 5** — cut the lowest-value themes, reduce maintenance
6. **Move Value Calculator + HLTB time into expandable section or /stats** — reduce StatsPanel complexity

### Consider Later
7. **Simplify archetype to single result** — remove re-roll
8. **Audit ShareCard usage** — cut if low adoption
9. **Strip heavy theme chrome** — keep colors, cut animations/trails

---

## Philosophy Check
The app's purpose is to get someone from "I have 200 games" to "I'm playing THIS one tonight" in under 60 seconds. Every feature that extends app-time without increasing play-time is suspect. The best session is: open app → get recommendation → close app → play game.

Current estimated time-in-app for core loop: ~30-45 seconds (import is one-time). That's good. Don't add features that push this toward 2-3 minutes of "exploring the app."
