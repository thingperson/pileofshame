  # Web App Icon Generation Brief — Reset / Anti-Drift Edition

Use this document as the **single source of truth** for generating the icon family.

This version is updated to prevent the exact failure modes that happened previously:
- drifting from the named subject into unrelated fantasy imagery
- adding text labels or filenames inside the image
- returning grouped sheets instead of one icon
- carrying too much concept baggage from the previous icon
- becoming more illustrative, realistic, or decorative over time

---

## 0) What this brief is for

Create a cohesive family of **small UI icons** for a gaming web app.

The icons must feel:
- modern
- gaming-native
- colorful but controlled
- bold enough for a dark UI
- simple enough to read at tiny sizes - think emoji size -
- slightly polished, but **not** painterly, realistic, or over-rendered
- must be visible at 24x24 pixel resolution - and not just "visible" but understandable at a glance



These icons are used at roughly **16–24 px** on a dark background (generally `#0a0a0f` depending on a user's chosen theme).

Each icon must be clearly recognizable at 16x16px. Design for that size first — if it doesn't read as a distinct shape at 16px, simplify further. Final delivery at 128x128px PNG with transparent background.

Style: Flat, single-shape silhouettes. No gradients, no shading, no perspective. Think app bar icons, not illustrations.

Colors: 2-4 max per icon. One dominant shape color + white or transparent negative space.

Stroke vs fill: Filled shapes, not outlined/stroked (outlines disappear at small sizes).
Background: Transparent, mandatory.

Test: If you squint and can't tell what it is, it's too detailed.


output should be on transparent background

---

## 1) Session operating rules (read first)

### Semantic source of truth
For **every icon**, use **this document** as the semantic source of truth.
Do **not** infer the subject from the previous image.
Do **not** improvise new symbolism unless this document explicitly allows an option.


### No text in image
Never place any of the following inside the image:
- filename
- label
- title
- category text
- UI text
- numbers unless explicitly part of the icon concept

### Anti-drift rule
If the previous icon was a flame, sword, ghost, chest, or any other strong motif, do **not** let that motif leak into the next icon unless the next icon’s concept explicitly calls for it.

Example:
- `mood-brainless` = brain + tiny ZZZ or power symbol
- **not** zombie head
- **not** skull
- **not** demon
- **not** slime creature
- **not** horror object

---

## 2) Core visual target

### Required style
- flat / semi-flat icon rendering
- low to low-moderate detail
- strong silhouette
- centered composition
- clean edges
- consistent outline treatment
- subtle inner shading allowed
- tiny-size readable

### Allowed polish
Allowed:
- small inner highlight
- restrained bevel feel
- modest soft shading within the icon itself
- slight dimensionality if it improves readability

Not allowed:
- painterly rendering
- realistic materials
- tiny texture details
- micro-decorations
- heavy glow clouds
- dramatic environment effects
- scene composition
- cinematic lighting
- loot piles unless explicitly part of the concept

### Visual family
All icons must share:
- similar simplification level
- similar line/edge weight
- similar density
- similar amount of interior detail
- similar level of stylization

If one icon becomes much more rendered than the others, it is off-brief.

---

## 3) Hard constraints

Apply these to **every icon**:
- **Canvas:** 256×256 px
- **Background:** transparent
- **Composition:** centered single icon
- **Legibility:** must read clearly at 16–24 px on dark background
- **Style:** clean, compact, UI-ready
- **Output:** one icon only at a time - each icon must be its own singular file each

Do **not** introduce any of the following unless explicitly requested:
- no text labels
- no filenames in image
- no sheets / rows / grouped sets
- no background badges, circles, or containers
- no drop shadows
- no outer glows
- no decorative spark showers unless concept clearly needs a tiny accent
- no textures
- no realistic scene lighting
- no monsters, demons, skulls, slime, gore, or horror motifs unless explicitly requested
- no extra props beyond what the concept needs

---

## 4) Small-size decision rule

When choosing between two versions of an icon, always prefer the version that is:
1. more readable at **16 px**
2. more recognizable in silhouette
3. more faithful to the named concept
4. more consistent with the family

If detail and readability conflict, **readability wins**.

---

## 5) Output protocol for every icon

For each icon generation, follow this exact protocol:

1. Look up the icon in this brief.
2. Use the exact subject, color, and concept from the list below.
3. Generate **that icon**.
4. Keep the style matched to the family.
5. Do not place the filename in the image.

### Self-check before accepting an output
Reject and regenerate the same icon if any of the following happen:
- wrong subject
- multiple icons in frame
- text appears in image
- concept drift from previous icon
- monster / fantasy creep not in brief
- too much texture or realism
- too much tiny detail for 16–24 px

## 6) Icon set

## SET 1: Status Icons (generate first)

### 1) Backlog
- **Filename:** `status-backlog.png`
- **Subject:** Backlog
- **Color:** muted slate blue `#8896a7`
- **Concept:** a neat stack of rectangles (game cases) seen from a slight angle. Represents “haven’t started yet.” Should feel like a waiting queue or shelf.

### 2) Up Next
- **Filename:** `status-upnext.png`
- **Subject:** Up Next
- **Color:** bright blue `#60a5fa`
- **Concept:** a flag planted upright, or a single rectangle pulled forward from a stack with a small forward arrow. Represents “queued to play soon.”

### 3) Now Playing
- **Filename:** `status-playing.png`
- **Subject:** Now Playing
- **Color:** vibrant green `#4ade80`
- **Concept:** a game controller with small motion/action lines radiating outward. Represents actively playing right now.

### 4) Completed
- **Filename:** `status-completed.png`
- **Subject:** Completed
- **Color:** gold `#fbbf24`
- **Concept:** a trophy with a small star above it, or a bold checkmark with a star. Represents finished / cleared.

### 5) Moved On
- **Filename:** `status-movedon.png`
- **Subject:** Moved On
- **Color:** warm muted rose `#f0a0a0`
- **Concept:** an open door with a small arrow or figure passing through it. Represents letting go peacefully.

---

## SET 2: Mood Tag Icons

### 6) Chill
- **Filename:** `mood-chill.png`
- **Subject:** Chill
- **Color:** cool teal `#5eead4`
- **Concept:** a reclining figure or a calm wave. Relaxed, easy energy.

### 7) Intense
- **Filename:** `mood-intense.png`
- **Subject:** Intense
- **Color:** hot red-orange `#ef4444`
- **Concept:** a flame or bold lightning bolt. Energetic and sharp.

### 8) Story-Rich
- **Filename:** `mood-story.png`
- **Subject:** Story-Rich
- **Color:** warm amber `#f59e0b`
- **Concept:** an open book with a few simple page lines. Narrative depth.

### 9) Brainless
- **Filename:** `mood-brainless.png`
- **Subject:** Brainless
- **Color:** soft pink `#f9a8d4`
- **Concept:** a brain with a power-off symbol or small ZZZ. Means “turn your brain off and play.”
- **Explicitly do NOT generate:** zombie head, skull, demon, slime, horror face, exposed bone, monster brain.

### 10) Atmospheric
- **Filename:** `mood-atmospheric.png`
- **Subject:** Atmospheric
- **Color:** deep indigo `#818cf8`
- **Concept:** a cloud with subtle stars or mist wisps. Moody, immersive, ambient.

### 11) Competitive
- **Filename:** `mood-competitive.png`
- **Subject:** Competitive
- **Color:** bold red `#dc2626`
- **Concept:** two crossed swords or a clean VS symbol. PvP energy.

### 12) Spooky
- **Filename:** `mood-spooky.png`
- **Subject:** Spooky
- **Color:** ghostly white-blue `#c4b5fd`
- **Concept:** a classic ghost with wide oval eyes. Eerie but simple.

### 13) Creative
- **Filename:** `mood-creative.png`
- **Subject:** Creative
- **Color:** vibrant orange `#fb923c`
- **Concept:** a paintbrush with a small stroke mark. Building, crafting, expressing.

### 14) Strategic
- **Filename:** `mood-strategic.png`
- **Subject:** Strategic
- **Color:** steel blue `#64748b`
- **Concept:** a chess knight piece. Think, plan, outmaneuver.

### 15) Emotional
- **Filename:** `mood-emotional.png`
- **Subject:** Emotional
- **Color:** deep rose `#f43f5e`
- **Concept:** a heart with a single small teardrop. Feelings-forward.

---

## SET 3: Reroll Mode Icons

### 16) Anything
- **Filename:** `reroll-anything.png`
- **Subject:** Anything
- **Color:** dual red + blue `#ef4444` and `#60a5fa`
- **Concept:** a pair of dice, one red and one blue, mid-roll.

### 17) Quick Session
- **Filename:** `reroll-quick.png`
- **Subject:** Quick Session
- **Color:** electric yellow `#facc15`
- **Concept:** a stopwatch or small clock with a lightning bolt overlaid.

### 18) Deep Cut
- **Filename:** `reroll-deepcut.png`
- **Subject:** Deep Cut
- **Color:** earthy amber `#d97706`
- **Concept:** a pickaxe or shovel digging downward into ground.

### 19) Keep Playing
- **Filename:** `reroll-continue.png`
- **Subject:** Keep Playing
- **Color:** fresh green `#22c55e`
- **Concept:** a circular continue arrow combined with a play triangle.

---

## SET 4: Time Tier Icons

### 20) Quick Hit
- **Filename:** `tier-quickhit.png`
- **Subject:** Quick Hit
- **Color:** bright green `#4ade80`
- **Concept:** a small stopwatch or timer showing a short duration.

### 21) Standard
- **Filename:** `tier-standard.png`
- **Subject:** Standard
- **Color:** sky blue `#38bdf8`
- **Concept:** a clock face showing moderate time.

### 22) Long Haul
- **Filename:** `tier-longhaul.png`
- **Subject:** Long Haul
- **Color:** warm orange `#f97316`
- **Concept:** a clock with extended hour markings or a sun moving across an arc.

### 23) Epic
- **Filename:** `tier-epic.png`
- **Subject:** Epic
- **Color:** deep purple `#a78bfa`
- **Concept:** a mountain peak silhouette or a large clock with bold presence.

### 24) Endless
- **Filename:** `tier-endless.png`
- **Subject:** Endless
- **Color:** gold `#fbbf24`
- **Concept:** a clean bold infinity symbol.

---

## SET 5: Navigation Icons

### 25) Search
- **Filename:** `nav-search.png`
- **Subject:** Search
- **Color:** white `#e2e8f0`
- **Concept:** a magnifying glass.

### 26) Import
- **Filename:** `nav-import.png`
- **Subject:** Import
- **Color:** purple `#a78bfa`
- **Concept:** a download arrow pointing into an open box or tray.

### 27) Add Game
- **Filename:** `nav-add.png`
- **Subject:** Add Game
- **Color:** green `#4ade80`
- **Concept:** a plus symbol inside a rounded rectangle outline.

### 28) Settings
- **Filename:** `nav-settings.png`
- **Subject:** Settings
- **Color:** grey `#94a3b8`
- **Concept:** a gear with clean teeth.

### 29) Stats
- **Filename:** `nav-stats.png`
- **Subject:** Stats
- **Color:** amber `#f59e0b`
- **Concept:** three ascending bar chart columns.

---

## 7) Generation order

Generate in this order:
1. Status icons (1–5)
2. Mood tags (6–15)
3. Reroll modes (16–19)
4. Time tiers (20–24)
5. Navigation icons (25–29)

---
