# Icon Generation — Revised Prompt Brief

This replaces the first batch (IF-icons.png) which had gradient backgrounds, 3D glossy style, and was a single sprite sheet. The ChatGPT-optimized brief at `docs/icon-generation-prompt-brief.md` covers mood tags (10), reroll modes (4), and time tiers (5) — 19 icons total.

**This file adds the missing sets** that aren't in that brief. Use the same master instruction and per-icon prompt pattern from the brief.

---

## Master Instruction (use once at session start)

"I'm generating a family of UI icons for a web app. Lock this visual style for the whole session: flat minimal monoline icons, solid white only, transparent background, centered composition, consistent stroke weight, readable at 16–24px, gaming-native but not childish, no gradients, no shadows, no text, no extra background shapes, no tiny details. Every icon should feel like part of the same family. Generate one icon at a time and preserve the same visual DNA across all of them."

## Per-Icon Prompt Pattern

"Generate the next icon in the same exact icon family and style. Transparent background, solid white monoline, 256×256, centered, clean at 16px. Subject: [ICON NAME]. Concept: [SHORT DESCRIPTION]. Keep stroke weight, visual density, and style matched to the previous icons."

---

## SET A: Status Icons (5 icons) — HIGHEST PRIORITY

These were missing from the first batch AND from the ChatGPT brief. Every game card shows a status badge, so these are the most-seen icons in the entire app.

### 20) Backlog
Subject: Backlog. Concept: a neat stack or pile of rectangles (game cases) seen from the side. Represents "haven't started yet." Should feel like a waiting queue.

### 21) Up Next
Subject: Up Next. Concept: a flag planted in the ground, or a single rectangle pulled forward from a stack with a small arrow. Represents "queued to play soon."

### 22) Now Playing
Subject: Now Playing. Concept: a game controller with small action/motion lines, or a play-button triangle inside a controller silhouette. Represents actively playing. Should feel energetic.

### 23) Completed
Subject: Completed. Concept: a trophy or a checkmark with a small star above it. Represents finished/cleared. Should feel like victory without being over-decorated.

### 24) Moved On
Subject: Moved On. Concept: an open door with a small arrow passing through it, or a hand releasing/waving. Represents letting go peacefully — not failure, just moving on.

---

## SET B: Navigation Icons (5 icons) — NICE TO HAVE

### 25) Search
Subject: Search. Concept: a magnifying glass. Classic, simple.

### 26) Import
Subject: Import. Concept: a download arrow pointing into an open box or tray.

### 27) Add Game
Subject: Add Game. Concept: a plus symbol inside a rounded rectangle (game case outline).

### 28) Settings
Subject: Settings. Concept: a gear with clean teeth, or three horizontal slider bars.

### 29) Stats
Subject: Stats. Concept: three ascending bar chart columns, or a small trophy case silhouette.

---

## Generation Order

If doing one session, generate in this order for maximum utility:
1. Status icons (20-24) — highest impact, missing from all previous batches
2. Mood tags (1-10) — from the ChatGPT brief
3. Reroll modes (11-14) — from the ChatGPT brief
4. Time tiers (15-19) — from the ChatGPT brief
5. Navigation (25-29) — nice to have

Total: 29 icons for a complete custom icon system.

---

## After Generation

Once icons are generated, drop them into `public/icons/` with these filenames:
- `status-backlog.png`, `status-upnext.png`, `status-playing.png`, `status-completed.png`, `status-movedon.png`
- `mood-chill.png`, `mood-intense.png`, `mood-story.png`, `mood-brainless.png`, `mood-atmospheric.png`, `mood-competitive.png`, `mood-spooky.png`, `mood-creative.png`, `mood-strategic.png`, `mood-emotional.png`
- `reroll-anything.png`, `reroll-quick.png`, `reroll-deepcut.png`, `reroll-continue.png`
- `tier-quickhit.png`, `tier-standard.png`, `tier-longhaul.png`, `tier-epic.png`, `tier-endless.png`
- `nav-search.png`, `nav-import.png`, `nav-add.png`, `nav-settings.png`, `nav-stats.png`

White monoline on transparent — CSS `filter` can tint them to any theme color.
