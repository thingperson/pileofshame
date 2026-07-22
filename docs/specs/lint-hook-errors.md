# Spec: Clear the 22 react-hooks lint errors blocking CI

**Status:** SPECCED — not started
**Created:** 2026-07-21
**Why it matters:** CI has failed on *every* push to `main` since the `verify.sh` gate landed 2026-07-06 (`1606000`). Each failure emails Brady. These 22 errors are the only thing left standing between the repo and a green gate.

---

## The mechanism

`.github/workflows/ci.yml` runs `./verify.sh`, which is `set -euo pipefail` over **lint → typecheck → build**. Lint runs first. It exits non-zero, so the job dies in ~54s and typecheck, build, and the Playwright smoke test **never execute**. Green CI is not just cosmetic here — right now the smoke test isn't running at all, so nothing is actually verifying the app boots in CI.

A first pass on 2026-07-21 (`b5d0c93`) cleared 13 mechanical errors (35 → 22). Everything left is `react-hooks`.

## Scope: 22 errors, 12 files

| File | Line(s) | Rule |
|---|---|---|
| `app/page.tsx` | 370, 403, 422, 526, 535 | set-state-in-effect |
| `components/GamePassBrowse.tsx` | 168, 190 | set-state-in-effect |
| `components/GamePassBrowse.tsx` | 208, 264 ×2 | preserve-manual-memoization |
| `components/NinetiesMode.tsx` | 18, 177 | set-state-in-effect |
| `components/StatsPanel.tsx` | 33, 59 | set-state-in-effect |
| `app/about/page.tsx` | 518 | set-state-in-effect |
| `components/AddGameModal.tsx` | 75 | set-state-in-effect |
| `components/CloudSync.tsx` | 86 | set-state-in-effect |
| `components/GetStartedModal.tsx` | 33 | set-state-in-effect |
| `components/JustFiveMinutes.tsx` | 109 | set-state-in-effect |
| `components/LandingPageV2.tsx` | 865 | set-state-in-effect |
| `components/SyncNudge.tsx` | 20 | set-state-in-effect |
| `components/CompletionCelebration.tsx` | 716 | purity |

Totals: 18 `set-state-in-effect`, 3 `preserve-manual-memoization`, 1 `purity`.

## Why these exist

`eslint-config-next@16` ships the React Compiler-era `react-hooks` rules. `set-state-in-effect` flags the `useEffect(() => setMounted(true), [])` hydration idiom, which was standard practice when this code was written and is all over the codebase. **These are not bugs.** They are a rule newly disagreeing with an established pattern.

That framing matters: the goal is a green gate **without changing behaviour**. A careless rewrite here causes SSR hydration mismatches or breaks localStorage-gated UI, which is strictly worse than a red CI badge.

## Approach — triage each site into one of three buckets

**Bucket A — genuinely removable.** State derived from props/other state that never needed an effect. Fix: compute during render, or use a lazy `useState(() => …)` initializer. Zero risk. Prefer this wherever it applies.

**Bucket B — client-only value read on mount.** The `mounted` flag, `localStorage.getItem`, `window.matchMedia`, `Math.random()`, `new Date()`. These *must* be deferred past hydration or server and client markup diverge. Candidates: `SyncNudge:20`, `NinetiesMode:18`, `StatsPanel:33`, `LandingPageV2:865` (the `Reveal` reduced-motion check).
Fix options, in order of preference:
1. `useSyncExternalStore` with a server snapshot — the sanctioned React 19 answer for "client-only external value," and it satisfies the rule.
2. If that's disproportionate for a one-line mount flag, keep the effect and add `// eslint-disable-next-line react-hooks/set-state-in-effect` **with a comment naming the specific hydration hazard.** A disable with a stated reason is an acceptable outcome here; a bare disable is not.

**Bucket C — memoization rules.** `preserve-manual-memoization` (`GamePassBrowse:208,264`) means a `useMemo`/`useCallback` dep array doesn't match what the compiler infers. Usually a genuine latent bug (stale closure). Read these carefully rather than reflexively silencing. `purity` (`CompletionCelebration:716`) flags something impure during render — likely `Math.random()` or `Date.now()` in the confetti path; hoist it into an event handler or effect.

## Constraints

- **`CompletionCelebration` is the crown jewel** (`.claude/rules/voice-and-tone.md`). Do not alter the confetti's observable behaviour. If the purity fix changes timing or appearance, stop and ask.
- **`CloudSync:86` and `SyncNudge:20`** touch the guest/sync boundary. Guest mode is a locked decision — a rewrite must not cause a signed-out user to see sync UI or vice versa.
- **`NinetiesMode`** is a theme easter egg with a localStorage guestbook and visitor counter. Cosmetic, but confirm the counter still increments.

## Definition of done

1. `./verify.sh` prints **`GATE PASSED`**.
2. `npm run test:e2e` passes locally (`./verify.sh --full`) — this is the first time the smoke test will have run in CI in weeks, so expect it to surface its own unrelated breakage. Budget for that.
3. Manual pass on the surfaces touched: landing page reveal animations, stats panel, Game Pass browse, sync nudge for a signed-out user, completion celebration, 90s theme.
4. Every remaining `eslint-disable` for these rules carries a comment naming the hydration hazard it's protecting against.
5. CI green on the next push to `main`.

## Sizing

Roughly one focused session. Bucket A/B sites are quick; `GamePassBrowse` memoization and the `CompletionCelebration` purity fix are the two that need real thought. Best done in a fresh session — it shares no context with feature work.

## Related

- `.claude/rules/deploy-gates.md` — the gate this unblocks
- `verify.sh` — the executable definition-of-done
- `b5d0c93` — the first pass that cleared the mechanical 13
