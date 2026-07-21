---
name: pre-push-review
description: Run before deploying a new version. Bundles build verification, copy review against voice-charter.md, accessibility check, terminology consistency, and code efficiency review. Auto-invoke when Brady is preparing a push that touches user-facing code (components/, app/) or after the git pre-push hook nags. Use at the end of a build phase or sprint, before deploying.
---

# Pre-Push Review Bundle

Run this skill before deploying a new version to production. It performs these checks in sequence:

## 1. Build Verification
- Run `npm run build` in /Users/bradywhitteker/Desktop/getplaying
- Report any TypeScript errors, missing imports, or build failures
- If build fails, stop and report. Do not proceed.

## 2. Copy & Voice Review
- **Primary gate:** check changed copy against `.claude/rules/voice-charter.md` — the canonical enforcement doc. Five principles, locked exceptions, banned-patterns shortlist, terminology table all live there.
- Load `.claude/rules/voice-and-tone.md` only if the charter flags something and you need the full vocab list.
- Scan all changed component files (`components/*.tsx`, `app/**/*.tsx`) for user-facing strings.
- Flag any text that violates the charter:
  - Em dashes used for dramatic pauses (should be periods, colons, or hyphens)
  - "That's not X, that's Y" reframes used more than once
  - LinkedIn vocab ("leverage", "landscape", "paradigm", "seamless", "robust", "unlock", "elevate", "dive into")
  - AI hallmark words ("delve", "tapestry", "journey")
  - Performative empathy ("That's a great question!") or sycophantic openers ("Absolutely!")
  - Hedging in CTAs ("maybe", "might", "feel free")
  - Summary closers ("In conclusion", "Ultimately")
  - Triple adjective lists, uniform paragraph lengths
- **Locked terminology — read it from the charter, don't trust a copy.**
  `.claude/rules/voice-charter.md` → "Locked terminology" is the single source of truth for the status cycle, taglines, and landing copy. Open it and check against what's there.

  This section used to restate that table and drifted out of date (it still named a landing subhead that the 2026-05-11 Phase 1 tightening had already replaced). Don't reintroduce a copy here. If the charter is ambiguous, fix the charter.

  Two things the charter doesn't spell out, so they live here:
  - **"Pick My Game" is the in-app picker CTA.** The landing page's live hero demo is a deliberate exception: it auto-picks on mount and its only button is "Roll again", because the mechanism is what the visitor needs to see, not a two-step flow. Confirmed 2026-07-21. Don't "fix" the landing to say "Pick My Game".
  - **`getPickReasons` copy is in-app only.** It speaks in second person about the player's own history ("Been in your pile a while"). Anything rendering picks from the sample library to a non-user — landing demo, marketing, OG cards — needs library-agnostic reason copy instead. See `demoReasons` in `components/LandingPageV2.tsx`.
- **Retired terms — flag if reintroduced:** "Play Next", "On Deck", "Buried", "Queue", "Active", "Cleared", "Beaten", "Bailed", "Dropped", "Abandoned", "Pile of Shame", "Stop stalling. Get playing.", "What Should I Play?"

## 3. Accessibility Quick Check
- Scan for new interactive elements (onClick on divs/spans) that lack keyboard handlers
- Check new modals have role="dialog", aria-modal, Escape handler
- Check new form inputs have aria-label or associated label
- Flag any new animations that might need prefers-reduced-motion support

## 4. Code Efficiency Check
- Check for obviously large component files (>500 lines) that should be split
- Flag any API calls happening on every render (missing useCallback/useMemo)
- Check for console.log statements left in
- Flag any hardcoded API keys or secrets
- Note any new dependencies added and whether they're justified

## 5. Ethical & Policy Compliance Check
- **No-sell rule**: We never recommend games the user doesn't already own or have wishlisted. If any new feature suggests, promotes, or links to games the user hasn't added themselves, STOP and flag it. This is a hard boundary.
  - Completion recommendations: only from user's own backlog or wishlist. Never inject external suggestions.
  - Deal badges: only on games the user owns or wishlisted. Never show unsolicited deals.
  - Any new recommendation, nudge, or "you might like" feature must be checked against this rule.
- **If the no-sell rule is being intentionally changed**: the following files MUST be updated together:
  - `app/privacy/page.tsx` (affiliate links section, line ~93-102)
  - `components/HelpModal.tsx` ("Will you try to sell me games?" FAQ)
  - `components/DealBadge.tsx` (FTC disclosure text)
  - `.claude/rules/voice-and-tone.md` (if tone around deals changes)
  - `.claude/plans/psychology-informed-features.md` (ethical boundaries section)
- **Affiliate disclosures**: Any new deal/price links must include FTC-compliant disclosure near the link (not just in privacy policy). Check `DealBadge.tsx` pattern.
- **Data collection changes**: If any new feature collects, stores, or sends user data not already disclosed, `app/privacy/page.tsx` must be updated before deploy.

## 6. Session-Resume Update Reminder
- Check if features were completed that should be reflected in the current session-resume doc (`docs/session-resume-YYYY-MM-DD.md`)
- If material decisions were made, remind to append to `docs/DECISIONS.md`
- For end-of-session ritual, prefer the `session-close` skill (writes both the resume doc + Brady OS handoff)

Report all findings in a structured format. If critical issues found (build failure, secrets exposed), recommend NOT deploying. Otherwise, give the green light.
