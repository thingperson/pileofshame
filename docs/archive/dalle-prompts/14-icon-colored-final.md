# Web App Icon Generation Brief — Colored Edition

Use this document as the source prompt for generating a full icon family for a web app.
Generate **one icon at a time**, but keep the style locked across the full set.
Do **not** wait for feedback between icons unless asked.

## Core Goal
Create a cohesive family of **small UI icons** for a gaming web app that feel:
- flat
- minimal
- clean silhouette
- gaming-native
- modern
- not childish
- colorful but controlled

These icons must remain readable at **16–24px** in a real interface on a dark background (#0a0a0f).

## Global Visual Rules
Apply these rules to **every icon** in the set:

- **Canvas:** 256×256 px
- **Background:** transparent
- **Color:** each icon has its own signature color (specified per icon below), with solid fills and clean edges
- **Style:** flat minimal, clean vector-like rendering, low detail
- **Detail level:** low to moderate, optimized for tiny UI use
- **Composition:** centered, balanced, simple silhouette
- **Legibility:** must read clearly at 16px on a near-black background
- **Visual family:** same level of simplification, same visual density, same corner treatment, same simplicity level across all icons

## Hard Constraints
Do not introduce any of the following unless explicitly requested:
- no gradients on the background
- no drop shadows
- no outer glows
- no textures
- no background shapes or circles behind the icon
- no text labels
- no tiny decorative details
- no overly realistic rendering
- no cartoon/chibi style
- subtle inner gradients on the icon itself are OK for depth, but keep them minimal

## Shape Guidance
Prefer symbols that are:
- instantly recognizable
- reduced to essential forms
- slightly game-adjacent in tone
- elegant rather than cute

When choosing between two concepts, prefer the one that is:
1. more readable at 16px
2. more iconic in silhouette
3. more visually consistent with the rest of the set

## Output Requirement
For each requested icon, return a **single transparent-background icon image** that matches this system.

---

## Master Instruction Prompt (use once at session start)

"I'm generating a family of colored UI icons for a gaming web app. Lock this visual style for the whole session: flat minimal icons with signature colors per icon, transparent background, centered composition, consistent visual density, readable at 16–24px on a dark background, gaming-native but not childish, no background shapes, no text, no tiny details. Subtle inner gradients are OK for depth. Every icon should feel like part of the same family despite having different colors. Generate one icon at a time and preserve the same visual DNA across all of them."

## Per-Icon Prompt Pattern

"Generate the next icon in the same exact icon family and style. Transparent background, 256×256, centered, clean at 16px on dark background. Subject: [ICON NAME]. Color: [COLOR]. Concept: [SHORT DESCRIPTION]. Keep visual density and style matched to the previous icons."

---

# Icon Set

## SET 1: Status Icons (5 icons) — GENERATE FIRST

Every game card shows a status badge. These are the most-seen icons in the entire app.

### 1) Backlog
Subject: Backlog. Color: muted slate blue (#8896a7). Concept: a neat stack of rectangles (game cases) seen from a slight angle. Represents "haven't started yet." Should feel like a waiting queue or shelf.

### 2) Up Next
Subject: Up Next. Color: bright blue (#60a5fa). Concept: a flag planted upright, or a single rectangle pulled forward from a stack with a small forward arrow. Represents "queued to play soon." Should feel like anticipation.

### 3) Now Playing
Subject: Now Playing. Color: vibrant green (#4ade80). Concept: a game controller with small motion/action lines radiating outward. Represents actively playing right now. Should feel energetic and alive.

### 4) Completed
Subject: Completed. Color: gold (#fbbf24). Concept: a trophy with a small star above it, or a bold checkmark with a star. Represents finished/cleared. Should feel like victory.

### 5) Moved On
Subject: Moved On. Color: warm muted rose (#f0a0a0). Concept: an open door with a small arrow or figure passing through it. Represents letting go peacefully — not failure, just moving on. Should feel calm and resolved.

---

## SET 2: Mood Tag Icons (10 icons)

These appear as small pills/tags on game cards showing the game's vibe.

### 6) Chill
Subject: Chill. Color: cool teal (#5eead4). Concept: a reclining figure or a calm wave. Relaxed, easy energy.

### 7) Intense
Subject: Intense. Color: hot red-orange (#ef4444). Concept: a flame or bold lightning bolt. Energetic and sharp.

### 8) Story-Rich
Subject: Story-Rich. Color: warm amber (#f59e0b). Concept: an open book with a few simple page lines. Narrative depth.

### 9) Brainless
Subject: Brainless. Color: soft pink (#f9a8d4). Concept: a brain with a power-off symbol or small ZZZ. Turn your brain off and play.

### 10) Atmospheric
Subject: Atmospheric. Color: deep indigo (#818cf8). Concept: a cloud with subtle stars or mist wisps. Moody, immersive, ambient.

### 11) Competitive
Subject: Competitive. Color: bold red (#dc2626). Concept: two crossed swords or a clean VS symbol. PvP energy.

### 12) Spooky
Subject: Spooky. Color: ghostly white-blue (#c4b5fd). Concept: a classic ghost with wide oval eyes. Eerie but simple.

### 13) Creative
Subject: Creative. Color: vibrant orange (#fb923c). Concept: a paintbrush with a small stroke mark. Building, crafting, expressing.

### 14) Strategic
Subject: Strategic. Color: steel blue (#64748b). Concept: a chess knight piece. Think, plan, outmaneuver.

### 15) Emotional
Subject: Emotional. Color: deep rose (#f43f5e). Concept: a heart with a single small teardrop. Feelings-forward.

---

## SET 3: Reroll Mode Icons (4 icons)

These appear as mode selector buttons in the game picker modal. Displayed at 24–32px.

### 16) Anything
Subject: Anything. Color: dual red and blue (#ef4444 and #60a5fa). Concept: a pair of dice, one red one blue, mid-roll. Random, fun, no filter.

### 17) Quick Session
Subject: Quick Session. Color: electric yellow (#facc15). Concept: a stopwatch or small clock with a lightning bolt overlaid. Fast and focused.

### 18) Deep Cut
Subject: Deep Cut. Color: earthy amber (#d97706). Concept: a pickaxe or shovel digging downward into ground. Unearthing something buried and forgotten.

### 19) Keep Playing
Subject: Keep Playing. Color: fresh green (#22c55e). Concept: a circular continue arrow combined with a play triangle. Smooth loop/resume energy.

---

## SET 4: Time Tier Icons (5 icons)

These show estimated play session length. Displayed at 16–20px on cards.

### 20) Quick Hit
Subject: Quick Hit. Color: bright green (#4ade80). Concept: a small stopwatch or timer showing a short duration. Under 5 hours. Quick and snappy.

### 21) Standard
Subject: Standard. Color: sky blue (#38bdf8). Concept: a clock face showing moderate time. 5–15 hours. Balanced.

### 22) Long Haul
Subject: Long Haul. Color: warm orange (#f97316). Concept: a clock with extended hour markings or a sun moving across an arc. 15–40 hours. Substantial.

### 23) Epic
Subject: Epic. Color: deep purple (#a78bfa). Concept: a mountain peak silhouette or a large clock with bold presence. 40–80 hours. Commitment.

### 24) Endless
Subject: Endless. Color: gold (#fbbf24). Concept: an infinity symbol, clean and bold. Non-finishable, multiplayer, sandbox. No end in sight.

---

## SET 5: Navigation Icons (5 icons) — OPTIONAL

### 25) Search
Subject: Search. Color: white (#e2e8f0). Concept: a magnifying glass. Classic, simple.

### 26) Import
Subject: Import. Color: purple (#a78bfa). Concept: a download arrow pointing into an open box or tray.

### 27) Add Game
Subject: Add Game. Color: green (#4ade80). Concept: a plus symbol inside a rounded rectangle outline.

### 28) Settings
Subject: Settings. Color: grey (#94a3b8). Concept: a gear with clean teeth.

### 29) Stats
Subject: Stats. Color: amber (#f59e0b). Concept: three ascending bar chart columns.

---

# Generation Order

For maximum utility, generate in this order:
1. **Status icons (1–5)** — highest impact, every card shows these
2. **Mood tags (6–15)** — second most visible, shown on cards and in filters
3. **Reroll modes (16–19)** — shown in game picker modal
4. **Time tiers (20–24)** — shown on card badges
5. **Navigation (25–29)** — nice to have, lowest priority

Total: 29 icons.

---

# File Naming

Drop generated icons into `public/icons/` with these filenames:

**Status:** `status-backlog.png`, `status-upnext.png`, `status-playing.png`, `status-completed.png`, `status-movedon.png`

**Moods:** `mood-chill.png`, `mood-intense.png`, `mood-story.png`, `mood-brainless.png`, `mood-atmospheric.png`, `mood-competitive.png`, `mood-spooky.png`, `mood-creative.png`, `mood-strategic.png`, `mood-emotional.png`

**Reroll:** `reroll-anything.png`, `reroll-quick.png`, `reroll-deepcut.png`, `reroll-continue.png`

**Time:** `tier-quickhit.png`, `tier-standard.png`, `tier-longhaul.png`, `tier-epic.png`, `tier-endless.png`

**Nav:** `nav-search.png`, `nav-import.png`, `nav-add.png`, `nav-settings.png`, `nav-stats.png`

---

# Consistency Reminder

Across all 29 icons, maintain:
- same degree of simplification
- same visual density and weight
- same flat rendering approach
- same level of detail (low-moderate)
- same small-size clarity
- colors should be saturated enough to pop on dark backgrounds but not neon

When in doubt, simplify.
