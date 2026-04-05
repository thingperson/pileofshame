# Theme Ideas

## Cozy
**Vibe**: Soft, gentle, like sinking into a pillow. Tranquil. A warm reading nook for your games.

**Typography**:
- No monospace anywhere. Replace JetBrains Mono with the display font (Outfit) everywhere.
- Rounded geometric sans — consider Nunito, Quicksand, or Poppins as override. Outfit already has some softness but could go further.
- Font sizes bumped 15-20% across the board. Nothing small. Easy on the eyes.
- Generous letter-spacing and line-height. Room to breathe.

**Colors**:
- Warm palette: cream/warm white backgrounds (#FAF7F2 or #F5F0EB), soft lavender accents, muted sage greens, dusty rose.
- No pure black text. Softest dark: #3D3837 or similar warm charcoal.
- Accent colors are pastel: soft purple (#B8A9C9), warm coral (#E8A598), sage (#A8C5A0).
- Status colors softened: backlog = warm grey, up next = soft blue, playing = warm amber, completed = sage green.
- No harsh borders. If borders exist, they're 1px with ~10% opacity, warm-toned.

**Layout/Spacing**:
- 50% more padding everywhere. Cards breathe. Tabs have generous hit targets.
- Rounded corners maxed out: 16px+ on cards, 24px+ on buttons.
- Subtle, warm shadows instead of sharp borders. Like physical cards sitting on a table.
- Background: gentle warm gradient or solid cream. No dark mode harshness.

**What gets removed/softened**:
- Mood shortcut buttons (Quick Session, Deep Cut, etc.) — collapse into the Reroll modal only
- Platform badges shrink or become just text
- Achievement percentages hidden (not the vibe)
- Enrichment indicator becomes a gentle progress dot, not a bar
- Status badges become softer pills with no ring borders
- Progression arrows become gentle text links, not bordered buttons
- No emoji icons — replaced with soft SVG icons or just text

**Feel**: Like a tea shop menu. You know what you want, the options are clear, nothing is yelling at you. Hygge for your game library.

---

## Minimal
**Vibe**: Least amount of information shown to achieve functionality. Swiss design. Information density of a haiku.

**Typography**:
- One weight of one font. Likely Inter or Outfit at regular weight only. Bold used sparingly (game names only).
- Monospace for nothing. Everything is the body font.
- Two font sizes max: body (14px) and small label (11px). That's it.
- Generous line-height (1.6+).

**Colors**:
- Two-color palette: near-black background (#0C0C0E) + one accent color (white at varying opacities).
- No status colors. Status indicated by position (which tab you're on), not color.
- Active tab: white text. Inactive tab: 40% opacity white. That's the whole color system.
- If an accent is needed: single muted tone. Cool grey (#6B7280) or similar.

**Layout/Spacing**:
- No cards. Games are plain text rows with a thin bottom border.
- No cover art visible by default. Maybe on hover/tap.
- No badges, no pills, no icons.
- Tab bar is just text: "Backlog  Up Next  Now Playing  Completed" — active one is white, rest are grey.
- Game row: just the name. Maybe hours played if > 0. That's it.
- Progression action: single "→" character at the end of the row. Nothing else.

**What gets removed**:
- All emoji
- All icons
- Cover art (unless tapped)
- Platform badges
- Time tier indicators
- Achievement displays
- Mood tags
- Source labels
- Gradient buttons — plain text buttons with underline on hover
- Hero CTA becomes "Pick for me" in plain text

**What stays**:
- Game name
- Tab navigation
- "Pick for me" button
- Move forward/back actions
- Search

**Feel**: Like a to-do list app that happens to be for games. Brutally simple. The void theme's more refined cousin — void strips for focus, minimal strips for clarity.

---

## Future Ideas (Parking Lot)

- **Retro Terminal**: Green-on-black CRT scanlines, all-caps monospace, cursor blink. `> LOADING BACKLOG... 9 TITLES FOUND.`
- **Cardboard**: Kraft paper textures, hand-drawn style borders, marker font for headings. Indie zine aesthetic.
- **Neon Arcade**: Black background, neon glow effects on text and borders. Outrun vibes. Pink/cyan/yellow neon.
- **Library Card**: Cream background, serif font (Merriweather/Lora), ruled lines, Dewey decimal numbering. Old-school library catalog card aesthetic.

---

## Palette Research (Apr 2026 — from Brady's Coolors deep dive)

### Minimal Theme Upgrade
Current minimal is near-black with opacity text. This palette has more character:
- `#2B2D42` (dark gunmetal) / `#8D99AE` (cool grey) / `#EDF2F4` (ghost white) / `#EF233C` (red accent) / `#D90429` (crimson)
- Source: https://coolors.co/palette/2b2d42-8d99ae-edf2f4-ef233c-d90429

### Tropical Theme (NEW)
- **Option A**: `#264653` (charcoal) / `#2A9D8F` (teal) / `#E9C46A` (saffron) / `#F4A261` (sandy brown) / `#E76F51` (burnt sienna)
  - Source: https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51
- **Option B**: `#1A535C` (dark teal) / `#4ECDC4` (mint) / `#F7FFF7` (honeydew) / `#FF6B6B` (coral) / `#FFE66D` (maize)
  - Source: https://coolors.co/palette/1a535c-4ecdc4-f7fff7-ff6b6b-ffe66d
- **Option C**: `#001524` (rich black) / `#15616D` (teal) / `#FFECD1` (papaya whip) / `#FF7D00` (amber) / `#78290F` (chocolate)
  - Source: https://coolors.co/palette/001524-15616d-ffecd1-ff7d00-78290f
- **Option D**: `#55DDE0` (sky) / `#33658A` (lapis) / `#2F4858` (charcoal) / `#F6AE2D` (saffron) / `#F26419` (orange)
  - Source: https://coolors.co/palette/55dde0-33658a-2f4858-f6ae2d-f26419

### Cozy Theme Alternatives
Current cozy is golden-cream. These feel warmer/earthier:
- **Earthy**: `#C9CBA3` (sage) / `#FFE1A8` (peach) / `#E26D5C` (terracotta) / `#723D46` (wine) / `#472D30` (dark chocolate)
  - Source: https://coolors.co/palette/c9cba3-ffe1a8-e26d5c-723d46-472d30
- **Soft natural**: `#CCD5AE` (sage) / `#E9EDC9` (tea) / `#FEFAE0` (cornsilk) / `#FAEDCD` (champagne) / `#D4A373` (fawn)
  - Source: https://coolors.co/palette/ccd5ae-e9edc9-fefae0-faedcd-d4a373

### Potential New Themes (unnamed)
- **Warm bold**: `#0D3B66` (prussian blue) / `#FAF0CA` (lemon chiffon) / `#F4D35E` (maize) / `#EE964B` (sandy) / `#F95738` (red-orange)
  - Source: https://coolors.co/palette/0d3b66-faf0ca-f4d35e-ee964b-f95738
- **Nature**: `#233D4D` (charcoal) / `#FE7F2D` (orange) / `#FCCA46` (saffron) / `#A1C181` (olivine) / `#619B8A` (wintergreen)
  - Source: https://coolors.co/palette/233d4d-fe7f2d-fcca46-a1c181-619b8a
- Could combine the warm bold + nature palettes into something like a "Sunset" or "Campfire" theme
