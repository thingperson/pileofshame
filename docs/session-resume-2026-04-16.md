# Session Resume — Apr 16, 2026

**Purpose:** Snapshot of what shipped today so tomorrow's session starts oriented.

---

## What landed today

Session continued from Apr 15 context (landing + OG rewrite, Track C reroll audit). Brady approved a batch of follow-ups and we executed.

### Psychology grounding
- New skill: `.claude/rules/user-psychology.md` — 6 research-backed foundations (Iyengar & Lepper, Schwartz, Sweller, Brehm + Deci & Ryan, Kahneman & Tversky, Amabile & Kramer) plus a 6-question sweep checklist. Resolves "we pick" vs "we help pick" as context-dependent: marketing warmth uses "help," in-product pick delivery drops it and speaks with confidence.

### Landing + about polish
- Hero subhead: "We'll help you pick. You do the playing."
- Hero h1 bumped to `text-4xl sm:text-5xl md:text-6xl` with `leading-[1.05]`.
- Differentiator reframed: "More library managing = less playing. / **We help you pick. You get playing.**" (no more Backloggd callout).
- Pull quote: "Not an **abandoned** warehouse of good intentions."
- Bottom CTA: h2 "Stop stalling. Get playing." with side-by-side hero-style buttons + "Free. No account required." caption below.
- Section padding tightened (`py-12 sm:py-16`) so sections connect without the empty-void feel.
- Reveal animation bumped: `translateY(40px) scale(0.985)` → `translateY(0) scale(1)` over 800ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- About page mirrors the landing now (same hero copy, PickModeCard grid replacing old FeatureCard grid).

### Hero image
- Generated `public/inventoryfull-hero-transparent@2x.webp` via `sharp` (768×512, quality 85, 122 KB) — Homebrew couldn't install `cwebp` on macOS 26.2.
- Landing + about both reference `@2x.webp` with sizing `w-56 sm:w-72 md:w-80 lg:w-96`.

### Completion OG card redesign
- `app/clear/[id]/opengraph-image.tsx` rebuilt. INVENTORY FULL logotype + logomark 2–3× bigger up top. Portrait game art (5:7, 200×280). Big CLEARED badge + title + stars. De-emphasized detail pills. `time_in_pile_days` dropped. Footer centered and bumped with tagline + domain stacked.

### "I beat it" affordance
- `components/GameCard.tsx` now shows a green 🏁 I beat it button on Playing Now cards. Click triggers `showCelebration(game)` — full confetti modal, parallel path to the status-badge cycle.

### Track C reroll fixes (audit → fixes landed)
- **Keep Playing**: `status === 'playing'` → `hoursPlayed >= 1 && status !== 'played' && status !== 'bailed'`. One-game-in-sample bug solved.
- **Deep Cut** reframed as a *personal deep cut with evidence*: `hoursPlayed >= 5 && status !== 'playing' && (status === 'on-deck' || status === 'buried')`. Copy on landing/about: "A world you lived in. Your save's still there."
- **Quick Session**: added `hltbMain > 12` cross-check (exempt `isNonFinishable`), so mis-tagged 50h sims can't leak in.
- **Mode descriptions** in `REROLL_MODES` rewritten to match new filter semantics.
- **Stale references** updated: `components/HelpModal.tsx:73` (all 5 modes described), `app/page.tsx:710` aria-label.
- Audit doc `docs/track-c-reroll-audit-2026-04-15.md` has a new "Fixes landed" section at the bottom.

### Docs
- `AGENTS.md` rewritten: 2-sentence thesis, stack snapshot, folder conventions, 6 locked decisions (including "less time in app = success"), in-progress vs stable, known gotchas (reroll mode collision, Turbopack, PSN tokens, etc.), deploy gates, how Brady works.

---

## Known follow-ups (not blocking)

- **Deep Cut label name**: `'deep-cut'` is both a `TimeTier` and a reroll mode — internal collision. Brady said "let's think more on the label." Candidates to pitch: "Take Me Back", "Open Save", "Worth Another Run", or keep "Deep Cut" with the sharpened meaning.
- **Mobile pass**: Brady said "tomorrow" — expect mobile-specific feedback soon.
- **Low-priority Track C #4**: document the `isNonFinishable` policy in `getEligibleGames`. Not blocking.

---

## Files touched today

- `.claude/rules/user-psychology.md` (created)
- `AGENTS.md` (rewritten)
- `app/about/page.tsx`
- `app/clear/[id]/opengraph-image.tsx`
- `app/page.tsx`
- `components/GameCard.tsx`
- `components/HelpModal.tsx`
- `components/LandingPage.tsx`
- `docs/track-c-reroll-audit-2026-04-15.md`
- `lib/reroll.ts`
- `public/inventoryfull-hero-transparent@2x.webp` (new)

---

## Deploy gates for this commit

1. Build passes — run `npm run build` after PATH fnm shim.
2. Voice sweep — landing + about + help modal + OG card + I-beat-it copy all need eyes. New copy to vet: "A world you lived in. Your save's still there." / "Short session tonight? We know which games are built for that." / "We'll help you pick. You do the playing." / "More library managing = less playing." / hero subheads.
3. Legal check — no new data collection, no new third parties. Hero webp is self-hosted. Clean.
4. Product axiom — all changes serve pick-time: better OG share (virality to new users who have the problem), better Playing Now affordance (I beat it = one-click celebration), reroll modes now match their promises. None add cognitive load at pick time.
