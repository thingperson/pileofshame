# Web App Icon Generation Brief

Use this document as the source prompt for generating a full icon family for a web app.
Generate **one icon at a time**, but keep the style locked across the full set.
Do **not** wait for feedback between icons unless asked.

## Core Goal
Create a cohesive family of **small UI icons** for a web app that feel:
- flat
- minimal
- monoline
- gaming-native
- modern
- clean
- not childish

These icons must remain readable at **16–24px** in a real interface.

## Global Visual Rules
Apply these rules to **every icon** in the set:

- **Canvas:** 256×256 px
- **Background:** transparent
- **Color:** solid white only
- **Style:** flat minimal monoline
- **Stroke weight:** consistent across the whole family
- **Detail level:** low to moderate, optimized for tiny UI use
- **Composition:** centered, balanced, simple silhouette
- **Legibility:** must read clearly at 16px
- **Visual family:** same stroke weight, same visual density, same corner treatment, same simplicity level

## Hard Constraints
Do not introduce any of the following unless explicitly requested:
- no gradients
- no shadows
- no glows
- no textures
- no background shapes
- no color other than white
- no text labels
- no tiny decorative details
- no overly realistic rendering
- no cartoon style
- no thick filled icon style unless needed for legibility

## Shape Guidance
Prefer symbols that are:
- instantly recognizable
- reduced to essential forms
- slightly game-adjacent in tone
- elegant rather than cute

When choosing between two concepts, prefer the one that is:
1. more readable at 16px
2. more iconic in silhouette
3. more consistent with a monoline system

## Output Requirement
For each requested icon, return a **single transparent-background icon image** that matches this system.

---

# Icon Set

## Mood Tag Icons

### 1) Chill
Create a flat, minimal, monoline white icon on a transparent background representing **“chill.”**
Preferred metaphor: a reclining figure or zen-like wave.
Keep it calm, relaxed, and immediately legible at small size.

### 2) Intense
Create a flat, minimal, monoline white icon on a transparent background representing **“intense.”**
Preferred metaphor: a lightning bolt or a flame.
Keep it energetic and sharp, but still clean and UI-friendly.

### 3) Story-Rich
Create a flat, minimal, monoline white icon on a transparent background representing **“story-rich.”**
Preferred metaphor: an open book with a few simple text lines.
Keep it readable and avoid excess line detail.

### 4) Brainless
Create a flat, minimal, monoline white icon on a transparent background representing **“brainless.”**
Preferred metaphor: a brain with a power symbol or subtle sleep cue.
Keep it playful but not goofy.

### 5) Atmospheric
Create a flat, minimal, monoline white icon on a transparent background representing **“atmospheric.”**
Preferred metaphor: a cloud with subtle stars, mist, or fog.
Keep it moody, soft, and uncluttered.

### 6) Competitive
Create a flat, minimal, monoline white icon on a transparent background representing **“competitive.”**
Preferred metaphor: crossed swords or a clean VS-style confrontation symbol.
Keep it crisp and game-native.

### 7) Spooky
Create a flat, minimal, monoline white icon on a transparent background representing **“spooky.”**
Preferred metaphor: a ghost or jack-o’-lantern.
Keep it eerie but simple, not horror-detailed.

### 8) Creative
Create a flat, minimal, monoline white icon on a transparent background representing **“creative.”**
Preferred metaphor: a paintbrush or palette.
Keep it expressive but stripped down.

### 9) Strategic
Create a flat, minimal, monoline white icon on a transparent background representing **“strategic.”**
Preferred metaphor: a chess knight or rook.
Keep it smart, stable, and instantly recognizable.

### 10) Emotional
Create a flat, minimal, monoline white icon on a transparent background representing **“emotional.”**
Preferred metaphor: a heart with a small teardrop.
Keep it restrained and elegant.

---

## Reroll Mode Icons

### 11) Anything
Create a flat, minimal, monoline white icon on a transparent background representing **“anything.”**
Preferred metaphor: a pair of dice or a shuffle symbol.
Keep it flexible, random, and easy to parse at tiny size.

### 12) Quick Session
Create a flat, minimal, monoline white icon on a transparent background representing **“quick session.”**
Preferred metaphor: a stopwatch or timer with a lightning bolt.
Keep it fast and focused.

### 13) Deep Cut
Create a flat, minimal, monoline white icon on a transparent background representing **“deep cut.”**
Preferred metaphor: a pickaxe or shovel digging downward.
Keep the idea of digging/discovery, but reduce detail aggressively.

### 14) Keep Playing
Create a flat, minimal, monoline white icon on a transparent background representing **“keep playing.”**
Preferred metaphor: a circular continue arrow combined with a play triangle.
Keep it smooth and clearly loop/continue-oriented.

---

## Time Tier Icons

### 15) Quick Hit
Create a flat, minimal, monoline white icon on a transparent background representing **“quick hit.”**
Preferred metaphor: a small clock showing a short duration, or one short vertical bar.
Meaning: under 5 hours.
Keep it simple and immediately distinct from the longer-duration icons.

### 16) Standard
Create a flat, minimal, monoline white icon on a transparent background representing **“standard.”**
Preferred metaphor: a medium clock or two bars.
Meaning: 5–15 hours.
Keep it visually related to the rest of the time-tier family.

### 17) Long Haul
Create a flat, minimal, monoline white icon on a transparent background representing **“long haul.”**
Preferred metaphor: a clock with extended duration cues or three bars.
Meaning: 15–40 hours.
Keep it clearly more substantial than Standard.

### 18) Epic
Create a flat, minimal, monoline white icon on a transparent background representing **“epic.”**
Preferred metaphor: a large-duration clock or four tall bars.
Meaning: 40–80 hours.
Keep it bold but still minimal.

### 19) Endless / Non-Finishable
Create a flat, minimal, monoline white icon on a transparent background representing **“endless / non-finishable.”**
Preferred metaphor: an infinity symbol or a clock with no hands.
Keep it unmistakable and clean.

---

# Recommended Generation Workflow

For best consistency, use the following pattern when prompting the model:

## Master Instruction Prompt
Use this once at the start of the session:

"I’m generating a family of UI icons for a web app. Lock this visual style for the whole session: flat minimal monoline icons, solid white only, transparent background, centered composition, consistent stroke weight, readable at 16–24px, gaming-native but not childish, no gradients, no shadows, no text, no extra background shapes, no tiny details. Every icon should feel like part of the same family. Generate one icon at a time and preserve the same visual DNA across all of them."

## Per-Icon Prompt Pattern
Then request each icon using this structure:

"Generate the next icon in the same exact icon family and style. Transparent background, solid white monoline, 256×256, centered, clean at 16px. Subject: [ICON NAME]. Concept: [SHORT DESCRIPTION]. Keep stroke weight, visual density, and style matched to the previous icons."

### Example
"Generate the next icon in the same exact icon family and style. Transparent background, solid white monoline, 256×256, centered, clean at 16px. Subject: Chill. Concept: a reclining figure or zen-like wave representing a calm, relaxed mood. Keep stroke weight, visual density, and style matched to the previous icons."

---

# Final Consistency Reminder
Across all 19 icons, maintain:
- same line thickness
- same degree of simplification
- same monochrome treatment
- same visual balance
- same app-UI friendliness
- same small-size clarity

When in doubt, simplify.
