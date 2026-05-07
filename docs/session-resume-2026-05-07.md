# Session Resume — 2026-05-07 (Wednesday, PDT)

**START HERE.** Landing page V2 redesign session. 12 commits on `landing-v2` branch. Nothing merged to main yet — Brady is sitting on it pending visual review of the Vercel preview.

## Active branch

`landing-v2` — complete landing page redesign in `LandingPageV2.tsx`. Do NOT merge to main until Brady says go.

## What shipped this session (9 commits, all on `landing-v2`)

1. **Angular composition redesign** — skewed panels, rotated headings, triangle accents, collage art direction
2. **Font size pass + interactive vibe picker** — 6 real game picks (Stardew Valley, Sekiro, Disco Elysium, Vampire Survivors, Portal 2, Inscryption)
3. **Design critique fixes** — CTA placement, trust signals, WCAG contrast compliance
4. **Self-hosted Steam capsule art** — replaced dead RAWG URLs with local files at `public/landing/games/*.jpg` (Steam CDN 616x353 landscape format)
5. **Animations** — hero entrance, IntersectionObserver scroll reveals (left/right/scale variants), micro-interactions (CTA glow, vibe pill hover)
6. **`.theme-poster`** — app theme matching landing aesthetic (pink primary, cyan accent, dark base). Registered in settings/types/theme switcher. Available in settings, not default.
7. **Pip robot character** — mid-page speech bubble ("We pick. You play. If it's not hitting, blame us and reroll.") + small wave in footer. Sprites at `public/landing/pip-wave.png` and `public/landing/pip-guide.png` (400px max dimension PNGs)
8. **Voice/psych/anti-AI audit** — killed "Stop scrolling. Start playing." (retired cadence), fake social proof numbers, duplicate reframe. 0 blockers remaining.
9. **Major copy overhaul:**
   - "pile" changed to "backlog" on landing page (user decision: people already know "backlog")
   - Removed Epic/GOG from platform bar (only available via Playnite CSV, not native import)
   - Consolidated messaging into "Less managing. More playing." + "get playing your games."
   - Banner: "Skip the overthinking. Just tap a vibe."
   - Bottom CTA: "Today's gaming session. One solid pick. That's the whole thing."
   - Added 5-minute pick feature callout + "Moving on is a decision too"
   - Killed duplicate "barely want your email"
   - Vibe picker art switched to landscape (was portrait-cropping 25% off sides)
10. **H1 swap + icons:** "Your backlog's not going to play itself." is now the h1. Distinct SVG line-art icons per problem bullet (clock, face, crosshair, list). Vibe picker pre-selects "I want to chill."
11. **Hero subhead rewrite:** "Ever feel that it's your library playing you..." + "fuel source" line moved to anti-tracker section
12. **Footer Pip fix:** `mix-blend-mode: screen` to kill white bg on dark footer. Dino theme line moved into Pip's speech bubble.

## Decisions made this session

- **"vibe" in marketing, "mood" in product** — intentional terminology split, Brady approved
- **"backlog" on landing, "pile" in-product** — connect with people using words they already know
- **Pip role** — "a character who shows up, not the mascot the way Mickey Mouse is." Mid-page with speech bubble, not dominating.
- **Poster theme ships but is not default** — bridges landing-to-app aesthetic gap, opt-in via settings
- **Branch stays on `landing-v2`** — Brady wants to sit on it before merging

## What's open / next

- **Visual review of Vercel preview** — Brady is checking the deployed preview
- **Merge to main** — clean merge when Brady is ready. No conflicts expected.
- **Theme polish** — `.theme-poster` works but is basic. Could get status color tuning, banner treatment, etc.
- **OG card redesign** — planned to align with new landing aesthetic. Pip-styled OG comps exist in notes/. Not blocking.
- **Voice charter update needed** — the terminology table says "Moods" not "Vibes", and "pile" not "backlog" on-page. Landing now uses "vibe" and "backlog" intentionally. Charter should document the marketing/product terminology split.

## Gotchas for next session

- **Preview screenshots are useless on dark sections** (JPEG compression). Use `preview_snapshot`, `preview_eval`, `preview_inspect` instead.
- **Game art is self-hosted** at `public/landing/games/*.jpg` — Steam CDN capsule format (616x353 landscape)
- **Pip sprites have no alpha channel** — `pip-wave.png` and `pip-guide.png` both have white backgrounds baked in. Footer uses `mix-blend-mode: screen` as workaround. Mid-page works because it's on cream bg. For proper transparency, re-export from source or use a background removal tool.
- **Git push needs `http.postBuffer=52428800`** for large binary pushes
- **Lint warning** — React 19 `set-state-in-effect` on the Reveal component's reduced-motion check (~line 813 of LandingPageV2.tsx). Not a real issue — reads a media query once on mount. Pre-existing warnings in NinetiesMode.tsx and SettingsMenu.tsx too.

## Verify on next session start

- [ ] `landing-v2` branch exists and is clean
- [ ] Vercel preview deploy is live and rendering correctly
- [ ] Game art images load (self-hosted, not external CDN)
- [ ] Pip sprites render at correct sizes

---

*Updated: 2026-05-07 ~11:45 AM PDT*
