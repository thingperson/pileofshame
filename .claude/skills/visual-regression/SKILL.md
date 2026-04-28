# Visual Regression

Catch the visual bugs Brady currently catches on the back end — orphan punctuation, double-stack headers, font swaps, contrast misses, hallucinated comp elements — before they ship. Encoded as a verifiable assertion library, run via the preview MCP, surfaced as a pass/fail report.

**Why this exists.** From the Apr 27 insights run: 27 sessions of multi-track sprints, recurring friction is Claude making visual-asset assumptions and Brady catching them on review. Examples that reached production: floating `.gg` after wordmark variant swap, Bungee font instead of brand SVG on OG card, redundant hero wordmark, double-stack landing header with stray black separator. Each cost a corrective iteration. This skill closes the loop: any visual change → screenshot + DOM/CSS introspection against assertions → fix surfaced or auto-iterated → only then commit.

---

## Operating principle

Different assertions need different verification primitives. **Don't pretend a screenshot can verify everything.** Map each assertion type to the right tool:

- **Layout / orphan punctuation / double-stack / element overlap** → `preview_screenshot` + multimodal vision read
- **Contrast ratios / computed font-family / used CSS values** → `preview_inspect` (reads computed CSS)
- **Element existence / DOM bbox / `naturalWidth` checks** → `preview_eval` (DOM introspection)
- **Voice / terminology / locked copy** → DOM text scan via `preview_eval` against `.claude/rules/voice-charter.md` banned-list

Sycophantic "looks great!" reads are the failure mode. Be adversarial. If you can't tell, say so — don't guess.

---

## When NOT to run

- **Pure data-layer changes** (store migration, API route logic, server-side enrichment). Nothing visual to regress.
- **Copy-only changes already vetted** — single-string copy edits already discussed against voice charter in conversation. The skill is for bulk surfaces, not one-line tweaks.
- **Fresh repo / nothing to compare against.** Skill is a regression check, not first-run validation.

If any apply, say so and stop.

---

## Step 1 — Confirm preview MCP is up

Run `preview_list`. If no server is running, ask Brady before starting one — `npm run dev` may collide with his local instance. Capture the `serverId` for the rest of the run.

If only Playwright is wanted (CI-style headless run), defer to `e2e/` and skip this skill — it's interactive verification, not a CI gate.

---

## Step 2 — Pick scope

One of:

- **Changed-files mode** (default) — read `git diff` since last main, list modified `components/**/*.tsx` + `app/**/*.tsx` + `lib/pixel/**` + `app/globals.css`, derive which assertion sets apply.
- **Full mode** — run every assertion in `assertions.md` against every listed page. Slow. Use before deploys that touch UI broadly.
- **Page-targeted mode** — Brady names a page or component, run assertions for that surface only. Use when iterating on a specific fix.

Confirm scope with Brady before running full mode.

---

## Step 3 — Run assertions

Load `.claude/skills/visual-regression/assertions.md`. For each in-scope assertion:

1. Navigate to the listed page via `preview_eval` (`window.location.href = ...`).
2. Wait ~1s for hydration (skip if HMR is hot).
3. Run the verification primitive named in the assertion (`vision` / `inspect` / `eval` / `text-scan`).
4. Record pass/fail + a one-line diagnostic.

Record results in a working table. Don't auto-fix yet — collect the full failure list first so the fix loop has the whole picture.

**Vision-check discipline.** When using `preview_screenshot`:
- Describe what you actually see, not what you hoped to see
- Call out positions, alignments, stray elements
- "Looks fine" is not a pass — name the assertion's check explicitly ("wordmark visually centered ±2px from header midline: pass") or fail it

---

## Step 4 — Triage failures

For each failure, classify:

- **Hard fail (blocker)** — contrast under WCAG AA, locked terminology violation, broken visible asset (clipped wordmark, missing image), accessibility regression (missing alt text, focus trap)
- **Soft fail (review)** — style drift inside acceptable tolerance, marginal layout shift, subjective polish
- **False positive (assertion bug)** — assertion didn't account for a known case (e.g., empty-state hides an element that's normally there)

Surface the triage as a markdown report. Brady greenlights fixes one-by-one or in batches. **No auto-commit without explicit go.**

---

## Step 5 — Fix loop (gated)

Only enter this step when Brady greenlights it. For each approved hard fail:

1. Implement the surgical fix (Edit, not rewrite).
2. Re-screenshot the affected surface.
3. Re-run *only the failed assertion* (not the whole library).
4. Pass → continue. Fail again → present the diff, ask before re-trying. Cap at 3 retries per assertion before bailing.

Soft fails stay in the report; Brady decides whether they ship.

---

## Step 6 — Final report

```
Visual regression pass — <date> · <scope>
✅ <N> assertions checked, <M> passed
❌ <K> hard fails surfaced (see below)
⚠️  <L> soft fails (review)
```

Then per-failure: assertion id, surface, diagnostic, proposed fix or "fixed in <commit-or-pending>".

---

## Boundaries

- Never auto-commit. The pattern's "Brady catches misses on review" — don't break that loop, automate everything *up to* the commit gate.
- Never edit `assertions.md` mid-run to make a failure go away. If an assertion is bogus, surface it in the triage as a false positive and fix the assertion in a separate pass.
- Don't fight `theme-check` or `accessibility-review` — those skills do deeper, scope-specific audits. Visual regression is the fast frontline that catches the patterns Brady already documented as recurring. If a finding wants `accessibility-review`-level depth, hand off.
- Don't expand the assertion library mid-run. New assertions need a separate pass + Brady approval; otherwise the library bloats and the skill slows.
- Keep the skill itself concise. Bloat = decay. The same rule that runs `voice-charter.md` runs here.
