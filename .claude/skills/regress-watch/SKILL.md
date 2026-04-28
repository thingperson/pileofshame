# Regress Watch

Named-bug regression catalog for Inventory Full. Encodes specific visual + structural failures that have shipped to production and Brady caught on review, so they can't slip in again.

**Scope intentionally narrow.** This skill is *not* a general visual checker. It's the institutional-memory layer: every assertion either (a) names a specific prior bug as a `regress-*` check, (b) covers a surface no other skill touches (OG card runtime split, pixel-sprite render), or (c) encodes a process pattern (read the asset before describing, never punt contrast as "designer's call").

**Where to go for the broader audits:**
- General WCAG contrast across themes → `/theme-check`
- Full WCAG 2.1 AA audit (touch targets, focus, semantics) → `/accessibility-review`
- Mobile viewport / safe-area / touch UX → `/mobile-best-practices`
- Voice charter / banned vocab / locked terminology sweep → `/pre-push-review`

If a finding belongs in one of those, hand off rather than duplicate. Skill bloat is the failure mode here.

---

## Operating principle

Different assertions need different verification primitives. **Don't pretend a screenshot can verify everything.** Map each assertion type to the right tool:

- **Layout / orphan punctuation / double-stack / element overlap** → `preview_screenshot` + multimodal vision read
- **Computed font-family / used CSS values** → `preview_inspect`
- **Element existence / DOM bbox / `naturalWidth`** → `preview_eval`
- **Voice-rule defers to `/pre-push-review`** — don't text-scan here

**Known artifact:** scroll-driven CSS animations can render below-fold sections as washed-out in `preview_screenshot` even when computed style is `opacity: 1`. When `inspect` says pass and `vision` says fail on the same section, **trust the computed style and report as a screenshot artifact**. Verify on real device only when both primitives flag the same issue. See `process-trust-computed-style-on-mismatch` in `assertions.md`.

---

## When NOT to run

- **Pure data-layer changes** (store migration, API route logic, server-side enrichment). Nothing visual to regress.
- **Single-line copy edits** already vetted in conversation. Use `/pre-push-review` for the broader voice sweep.
- **Changes scoped to a category another skill owns** — theme contrast → `/theme-check`, mobile-only → `/mobile-best-practices`. Don't double-run.

If any apply, say so and stop.

---

## Step 1 — Confirm preview MCP is up

Run `preview_list`. If no server is running, ask Brady before starting one — `npm run dev` may collide with his local instance. Capture the `serverId` for the rest of the run.

---

## Step 2 — Pick scope

One of:

- **Changed-files mode** (default) — read `git diff` since last main, list modified files, derive which `regress-*` assertions apply.
- **Full mode** — run every assertion in `assertions.md` against every listed page. Slow. Use before deploys that touch UI broadly.
- **Page-targeted mode** — Brady names a page or component, run assertions for that surface only.

Confirm scope with Brady before running full mode.

---

## Step 3 — Run assertions

Load `.claude/skills/regress-watch/assertions.md`. For each in-scope assertion:

1. Navigate to the listed page via `preview_eval` (`window.location.href = ...`).
2. Wait briefly for hydration.
3. Run the verification primitive named in the assertion.
4. Record pass/fail + a one-line diagnostic.

**Vision-check discipline.** When using `preview_screenshot`:
- Describe what you actually see, not what you hoped to see
- Call out positions, alignments, stray elements
- "Looks fine" is not a pass — name the assertion's check explicitly

---

## Step 4 — Triage failures

For each failure, classify:

- **Hard fail (blocker)** — a named regression has reappeared, or a runtime smoke check failed (OG card not rendering, sprites not rendering)
- **Soft fail (review)** — borderline, needs Brady's eye
- **False positive** — assertion didn't account for a known case, OR the screenshot/computed-style mismatch artifact fired

Surface as a markdown report. **No auto-commit without explicit go.**

---

## Step 5 — Fix loop (gated)

Only enter when Brady greenlights. For each approved hard fail:
1. Implement the surgical fix.
2. Re-run *only the failed assertion*.
3. Pass → continue. Fail again → present diff, ask before retrying. Cap at 3 retries before bailing.

---

## Step 6 — Final report

```
Regress Watch — <date> · <scope>
✅ <N> assertions checked, <M> passed
❌ <K> hard fails (named regression reappeared)
⚠️  <L> soft fails (review)
🔍 <P> false positives (assertion refinement candidates)
```

Per-failure: assertion id, surface, diagnostic, proposed fix or "fixed in <commit>".

---

## Boundaries

- **Never auto-commit.** Brady greenlights every push. Don't break the human-in-the-loop pattern this skill is built to support.
- **Don't expand the assertion library mid-run.** New `regress-*` entries need a separate pass when a real bug ships and gets caught — that's how the catalog grows. Speculative assertions bloat the library and slow the skill.
- **Don't fight `/theme-check`, `/accessibility-review`, `/mobile-best-practices`, or `/pre-push-review`.** Those skills do deeper, scope-specific audits. Regress Watch is the fast frontline that catches Brady's named misses. If a finding wants depth, hand off.
- **Don't delete a `regress-*` assertion** without a DECISIONS entry — they're load-bearing institutional memory.
- **Keep this skill concise.** Bloat = decay. Same rule that runs `voice-charter.md` runs here.
