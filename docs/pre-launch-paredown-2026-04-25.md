# Pre-Launch Pare-Down — Parking Lot

Created 2026-04-25. **Not yet decided.** This is the menu of cuts surfaced by the feature-creep audit on 2026-04-25 (see `docs/session-resume-2026-04-25.md` § C). Brady has not committed to any of these — listed here so they're easy to find and execute when ready.

Each item: what it does, why it dilutes, exact files to touch, severity, estimated time. Ordered by recommended priority.

---

## 1. Lock the 6 default categories — no custom-shelf creation

**What:** Remove any UI that lets users create new categories beyond the 6 baked-in shelves (The Pile, Brain Off, The Shame Wall, etc.).

**Why it dilutes:** Organization is the trap. Custom shelves let users spend time arranging instead of playing — that's the exact behavior we're trying to undo. Every "create a shelf for my racing games" is mental load we're inviting in.

**How to remove:**
- Audit `components/SettingsMenu.tsx` for any "add category" button (estimated ~lines 200–300 area).
- Audit `lib/store.ts` for an `addCategory` action that's user-callable.
- If the UI exists: delete the button + the handler.
- Keep the 6 defaults defined as constants. Lock them.
- Keep the `addCategory` store action only if it's used by import/seed code; otherwise remove.

**Severity:** must-cut if user-facing UI exists; nothing to do if it's already internal-only.
**Time:** 15–30 min.
**Risk:** low. Migration path: any users who already created a custom category keep it (don't blow up their localStorage), but no new ones can be made.

---

## 2. Gate or remove the AffiliateDisclosure component

**What:** The `AffiliateDisclosure` component currently lives in the codebase as scaffolding for a future deal-affiliate feature. RAWG Commercial license + Stripe + FTC disclosure aren't live, so this is dead UI.

**Why it dilutes:** Shipping unfinished revenue scaffolding signals "monetization live" when it isn't. Invites questions we can't answer. Also a legal-compliance exposure if it leaks into a render path.

**How to remove:**
- `grep -rn "AffiliateDisclosure\|DealBadge" components/ app/` — find all usages.
- Either: gate everything behind `if (process.env.NEXT_PUBLIC_AFFILIATE_ENABLED)` so it's compile-time-removable. Or simpler: delete the imports and the component file entirely. Recreate from git when needed.
- Verify no game-card surface still calls into deal-checking code paths.

**Severity:** must-cut. Don't ship scaffolding.
**Time:** 20–40 min.
**Risk:** low. Pure UI removal, code restorable from git.

---

## 3. Custom vibes → fixed 10-mood palette

**What:** Revert the "create your own custom mood tags" feature. Lock to 10 fixed moods.

**Why it dilutes:** Nobody asked for it. Edge-case feature for the 1% who want bespoke moods. Adds a Settings entry, adds store complexity, signals "we don't know what moods matter" — we do.

**How to remove:**
- `lib/store.ts` — find `customVibes` state, `addVibe` / `removeVibe` actions.
- Remove the actions but **keep** the read of any existing custom vibes from localStorage (don't break existing users — let them stay until manual cleanup or migration). Just no new ones can be made.
- Find the SettingsMenu UI that exposes this (probably an "Add custom mood" input) and remove it.
- Confirm `Reroll.tsx` mood-filter logic still works with the fixed 10-tag list (it should).

**Severity:** should-cut. Clean for launch.
**Time:** 30–45 min.
**Risk:** low-medium. Need to leave migration crumbs so existing users don't lose their saved custom vibes silently. Or accept that and surface a one-time toast: "Your custom moods have been retired in favor of a focused set."

---

## 4. Themes 13 → 3 visible (Dark / Dino / 90s)

**What:** Hide 10 of the 13 themes behind a "more themes coming" placeholder. Keep code in place.

**Why it dilutes:** 13 themes signals indecision. 3 (default + 2 easter eggs) signals taste. Onboarding the user past a 13-option theme picker is friction we don't need at launch.

**How to remove:**
- `components/SettingsMenu.tsx` — find the theme picker grid.
- Filter the displayed options to: `['dark', 'dino', '90s']` (or whichever set Brady picks).
- Below the visible options, add a muted line: *"More themes coming."* No interaction.
- The CSS for hidden themes stays in `app/globals.css` — they remain functional, just unsurfaced. Deep-link `?theme=cozy` still works for users who already set it.

**Severity:** should-cut for visibility.
**Time:** 20 min.
**Risk:** very low. Cosmetic UI filter only.

---

## 5. Sub Shuffle → secondary nav (sub-option of Add Games)

**What:** The Game Pass + PS+ catalog browser is currently a top-level surface. Move it under "Add games → Sub Shuffle."

**Why it dilutes:** "Browse a catalog of games you don't own" is the paralysis trap we solve. As a top-level surface it competes with import/backlog/playing-now for nav real estate. As an import sub-option it serves the same job (sourcing games into your library) without inviting browse-loops.

**How to remove:**
- Find the primary nav (likely in `app/page.tsx` or a Nav component) that surfaces Sub Shuffle / GamePassBrowse.
- Move the link under the Import flow / ImportHub modal as a tab or extra option.
- Keep the route + component; just change the entry point.

**Severity:** should-cut visibility, keep feature.
**Time:** 30–45 min.
**Risk:** medium. Touches navigation, deep-link compatibility, possibly empty-state copy.

---

## 6. Tone down "we learned X about you" framing

**What:** Behavioral nudges (stalled-game detection, "did you finish?" prompts) currently use language that reads as "we noticed you…" — soften to stating facts instead of inferring.

**Why it dilutes:** Even though all the data stays client-side, the surveillance-y framing is a trust hit. "We noticed you haven't played X in 14 days" reads like tracking. "Unfinished: Stardew Valley" reads like a calendar.

**How to remove:**
- Find StalledGameNudge, FinishCheckNudge components.
- Rewrite the surface copy to state facts, not infer behavior.
- Engine logic stays unchanged.

**Severity:** consider-cut. Pure copy work.
**Time:** 30 min.
**Risk:** low. Voice-charter pass required on rewrites.

---

## What we're NOT cutting

For the record — features that came up in audit but stay:

- **Skip feedback pills** — trains the engine, optional, low load.
- **Cloud sync** — opt-in, doesn't gate anything, retention lever.
- **Sample library + onboarding** — high conversion lever, drops time-to-first-pick.
- **Completion celebration + share cards** — virality + emotional payoff.
- **Jump Back In tips** — keep top 50, don't expand.
- **Just 5 Minutes** — niche but understood, ships as-is.
- **Genre cooldown** — invisible engine feature.
- **List + Grid view toggle** — minimal cost.
- **Stats panel + archetypes** — keep, but watch for "optimize your numbers" pressure.
- **Game detail modal** — necessary for power users.

---

## Total estimated time if all 6 ship

~2.5–3.5 hours. Less if Brady decides "lock categories" and "gate affiliates" are already done internally.

## How to use this doc

When Brady decides which to take, he can either:
1. Ask Claude to execute one or more by item number.
2. Use this as a punch list during a focused pre-launch sprint.

Items are independent — any subset can ship.

---

*Sourced from `docs/session-resume-2026-04-25.md` § C (feature-creep + paid-tier audit).*
