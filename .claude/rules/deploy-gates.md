# Deploy Gates — Mandatory Pre-Push Checks

These are HARD REQUIREMENTS before any `git push` to main. No exceptions, no "I already checked manually." Run the skills.

## Before ANY push to main, you MUST:

### 1. Build passes
Run `npm run build`. If it fails, stop. Do not push broken code.

### 2. Voice/AI lingo sweep (if any user-facing copy changed)
Check changed copy against `.claude/rules/voice-charter.md` — the canonical enforcement doc. That's the ship-or-don't-ship bar: five principles, short banned-patterns list, locked exceptions (help-language marketing/fulfillment split, Moving On canon), terminology table. The longer `voice-and-tone.md` is deep-dive reference; only load it if the charter flags something and you need the full vocab list. Non-negotiable — user has explicitly requested this runs on every deploy with new copy.

### 3. Legal compliance check (if features touch user data, deals, profiling, or notifications)
Review against `.claude/rules/legal-compliance.md`. Key questions:
- Does this feature push content the user didn't request? → needs consent
- Does behavioral data drive a purchase or commercial action? → needs disclosure
- Is any new user data being collected, stored, or sent to a third party? → update Privacy Policy first
- Could a third party benefit from our knowledge of a specific user? → hard no

If any grey area trigger fires, resolve it before pushing. Policy updates must ship WITH or BEFORE the feature, never after.

### 4. Product axiom check (if features were added or modified)
Ask: "Does this change help someone get from 'I want to play something' to actually playing in under 60 seconds?"

Check against the core loop: **Import → Tell us your mood → We find your game → Play → Celebrate**

If a change adds complexity, cognitive load, or time-in-app without serving the core loop, flag it.

### 5. For large changes (multiple features, end of sprint)
Run the full `/pre-push-review` skill which bundles all of the above plus accessibility, code efficiency, and policy compliance checks.

## Why this exists
The voice sweep and product axiom check were skipped on a deploy (2026-04-02) because nothing enforced them. The user caught it. These are not optional nice-to-haves — they are quality gates.
