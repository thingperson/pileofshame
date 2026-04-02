---
name: pre-push-review
description: Run before deploying a new version. Bundles build verification, copy review, accessibility check, terminology consistency, and code efficiency review. Use at the end of a build phase or sprint, before deploying.
---

# Pre-Push Review Bundle

Run this skill before deploying a new version to production. It performs these checks in sequence:

## 1. Build Verification
- Run `npm run build` in /Users/bradywhitteker/Desktop/getplaying
- Report any TypeScript errors, missing imports, or build failures
- If build fails, stop and report. Do not proceed.

## 2. Copy & Voice Review
- Scan all component files (components/*.tsx) for user-facing strings
- Flag any text that violates the voice guide at .claude/rules/voice-and-tone.md:
  - Em dashes used for dramatic pauses (should be periods, colons, or hyphens)
  - "That's not X, that's Y" constructions
  - AI hallmark words: "delve", "tapestry", "landscape", "journey", "elevate", "unlock"
  - TikTok/Gen-Z slang that doesn't match our "witty adult gamer" voice
  - Dismissive text in help/onboarding contexts
- Check terminology consistency per the voice guide's terminology table:
  - "Play Next" not "Up Next"
  - "What Should I Play?" not "Get Playing"
  - "Moods" not "Vibes" in UI
  - "Session length" not "Time tier"
  - "Cleared" not "Completed" for game status
  - "Shelf" not "Category" for user-facing organization
  - "Bailed" not "Dropped" or "Abandoned"

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

## 6. Plan Update Reminder
- Check if features were completed that should be reflected in the plan doc
- Remind to update /Users/bradywhitteker/.claude/plans/partitioned-fluttering-flurry.md

Report all findings in a structured format. If critical issues found (build failure, secrets exposed), recommend NOT deploying. Otherwise, give the green light.
