# Session Resume — 2026-08-06

⚡ **START HERE.** Prior: [`session-resume-2026-08-03.md`](session-resume-2026-08-03.md). This session ran a full roadmap inventory (107 items swept → 41 actionable → 27 needing a decision from Brady), then a research pass to unblock the hardest of those 27, then — with Brady live — started working the decision sheet: RAWG/IGDB/caching resolved and shipped, Year-in-Pile and monetization-platform calls made, B1 prod-health loop built and registered. Most of the 27-item decision sheet is still unwalked — this is a partial pass, not a close-out.

> 🔴 **Unexpected working-tree state found, not touched.** `CLAUDE.md` shows as modified in `git status` — on disk it's the full expanded content (`# Inventory Full (web) — CLAUDE.md...`), but `git diff` shows it changing FROM a one-line `@AGENTS.md` import pointer. This wasn't done by this session — nobody here edited that file. Could be a previous session's edit that was never committed, or a concurrent session. Investigate before committing or reverting it; don't assume either direction is correct.

---

## 🎯 NEXT SESSION STARTS HERE

### PRIORITY 1 — in-app account deletion (web) — still carried, still untouched

Unchanged from 08-03. `delete-account` Edge Function still only exists on Dev (`xafdnhsuiygbsfuqtdav`); prod (`lrzjszthlmcivgyprqnb`) still has zero edge functions. See `session-resume-2026-07-16.md` + `DECISIONS.md` 2026-07-16 for the full plan.

### Inbound handoff still not actioned

`Handoffs/inbox/2026-07-24-inventory-full-to-getplaying-contract-bugs.md` — still not read/actioned.

### The decision sheet (this session's main artifact) is ~5/27 worked

Full sheet content lives in this conversation's transcript (not yet saved to a repo file — consider writing it to `docs/decision-sheet-2026-08-06.md` next session if it'll take more than one sitting to work through). Addressed this session: RAWG ruling (attribution + caching, see below), Year-in-Pile (deferred), monetization platform routing (web free / iOS paid), enrichment Phase-4 unbundling (agreed, not yet split out into separate spec items), B1. **Untouched:** the other ~22 items, including several cheap "just rule" ones (naming alignment, D5 runbook, connections table, SEO pages, parking-lot cleanup) that were flagged as fast to clear.

### RAWG — shipped, not deployed; two things need Brady

1. **Not pushed.** `app/api/rawg/route.ts` + `app/page.tsx` changes are on disk, uncommitted. Run the usual deploy-gates sweep before pushing (voice charter doesn't really apply here — no user-facing copy beyond one footer link — but build + legal quick-check do).
2. **RAWG's own domain is still down** (connection-level failure as of ~20:15 PDT tonight, worse than the earlier 522s — no ETA, their status page is part of what's down). The commercial-terms question from the earlier decision sheet (does the free tier really cover commercial use up to 20k req/month) is still unverified against RAWG's live terms pages for that reason. Recheck when they're back before treating that ruling as final.

### IGDB — email drafted, not sent; adoption needs more than the email

`docs/igdb-partner-email-draft.md` — ready to send, Brady sends it himself. **Answering his "is that all we need?": no.** Confirmed today: IGDB requires a Twitch developer account, Client ID/Secret, and an OAuth2 token-exchange flow — no direct browser calls allowed (unlike RAWG's key-in-URL model), so adopting it means building a backend proxy with token refresh logic, not just swapping a key. The email is the commercial-terms half of the gate; the OAuth backend is a separate, real build task, not yet scoped as its own item.

### Stale HLTB references — flagged last session, still not fixed

`app/terms/page.tsx:70` still lists HowLongToBeat as an API in use (false since 2026-07-19). `app/pile/[id]/page.tsx` still tells users hours-to-complete is "sourced from HowLongToBeat" (it's RAWG `playtime` now). Cheap, asked about, not yet actioned — Brady didn't confirm go-ahead this session.

### Cosmetic Premium Subscription (monetization stream #5) — flagged, not ruled

Brady's "web stays free, paid goes through iOS" ruling logically conflicts with this web-based subscription stream, but he didn't explicitly address it. Don't build it without asking — see `docs/monetization-plan.md` Amendments — 2026-08-06.

---

## What happened this session

**Roadmap inventory (2 workflows, ~19 agents total).** Swept `docs/ROADMAP.md`, `docs/INDEX.md`, every file in `docs/specs/`, the last 3 session-resume docs, `docs/smaller-surgeries.md`, Handoffs inbox, and codebase TODOs/FIXMEs. 107 raw items → canonicalized → validated against `DECISIONS.md` + the 7 locked architectural decisions + legal-compliance hard lines + the core-loop/agency axioms. Result: 41 actionable, 27 needing a decision, 8 already-shipped-doc-was-stale, 31 killed (contradicted a locked decision). Full brief and dependency graph delivered as a file to Brady, not saved to the repo.

**Decision-sheet prep.** A second research pass closed the gaps that made 5 of the 27 undecidable: RAWG's actual terms (found the free tier likely permits commercial use up to a request quota — the original blocker's premise looks wrong, pending live-page reverification), `docs/IDEAS.md` (42KB, promoted 3 items — Jump Back In tip-matcher bug, surfacing `game.notes`, visible provenance labels — rest archived-worthy), older `docs/audits/` reports, and the out-of-repo bradyOS B1 brief + iOS `LibraryMerge.swift` golden tests (informing the `merge_library` RPC spec). Produced a pre-filled recommendation for all 27, delivered as a file.

**RAWG work, shipped to code + prod DB:**
- Footer attribution link added (`app/page.tsx`) — "Game data via RAWG," footer only, not per-card, per Brady's ask.
- Search-branch caching fixed — this was the actual uncached path (every import did a live RAWG search call, even for titles other users had already imported). `app/api/rawg/route.ts` now checks Supabase L2 before hitting RAWG, and write-throughs both a new `rawg_search_cache` table and the existing `game_metadata` table so future slug lookups benefit too.
- Quiet monthly usage counter (`rawg_usage_log`) — counts live RAWG calls only (not cache hits), no UI, no blocking, purely for Brady's own visibility per his explicit "don't make users fear enriching their data" instruction.
- **Migration applied directly to prod** (`lrzjszthlmcivgyprqnb`) via Supabase MCP — both new tables live, RLS on, public-read-only, matching the `game_metadata` pattern exactly. Brady authorized this explicitly ("you can create the databases you need").

**IGDB research (fresh, same day).** Confirmed via a live rendered fetch of `api-docs.igdb.com` (the earlier 403 was bot-detection, not the site being down): free for both commercial and non-commercial use, no dollar cost, but commercial use goes through a partnership process (email `partner@igdb.com`) with visible-attribution as the ask in return. Also confirmed the OAuth/Twitch-dev-account integration overhead (see above). Noted a 2026-05-13 `DECISIONS.md` entry that had already ruled out IGDB, reasoned from what may be RAWG's now-disputed premise — flagged for Brady, not resolved.

**Doc amendments (not full rewrites):**
- `docs/monetization-plan.md` — new Amendments — 2026-08-06 section: web-stays-free/iOS-paid ruling, Year-in-Pile deferral, RAWG-gate premise flag.
- `docs/year-in-pile-spec.md` — deferred banner added at top; body (still describing a $5 web Stripe checkout) left as-is, needs a rewrite before this becomes buildable again.
- Memory updated: iOS pricing (was $9.99, now "starts low ~$3"), web-free/iOS-paid routing, ~10-user scale context for future roadmap scoping.

**B1 prod-health loop — built and registered.** `docs/specs/health-loop.md` (new spec) + scheduled task `inventory-full-prod-health-daily`, cron `0 8 * * *` (daily 8:05am local). Checks Sentry (both projects: `javascript-nextjs`, `inventory-full-bot`) for new/unresolved issues in the last 24-48h, summarizes in plain language, never auto-fixes. Deliberately does NOT duplicate UptimeRobot (already pings `/api/health`). Note: Sentry MCP tools were disconnected mid-session (reconnect cycling, not unique to Sentry) — the task prompt handles that by searching fresh each run rather than assuming availability. **Brady should click "Run now" once from the Scheduled sidebar to pre-approve the Sentry tools** so future daily runs don't stall on a permission prompt.

## Health snapshot

- **Gate:** not run this session — nothing pushed. Run `./verify.sh` before pushing the RAWG changes.
- **`main` tip:** unchanged from 08-03 (still committed-not-pushed from that session). This session's changes are uncommitted on top.
- **Files this session:** `app/api/rawg/route.ts`, `app/page.tsx` (code) · `supabase/migrations/009_rawg_search_cache.sql` (applied to prod directly, also on disk) · `docs/monetization-plan.md`, `docs/year-in-pile-spec.md` (amended) · `docs/specs/health-loop.md`, `docs/igdb-partner-email-draft.md` (new) · this file.
- **Prod DB:** two new tables live (`rawg_search_cache`, `rawg_usage_log`), applied via Supabase MCP this session — not from a migration Brady ran himself, worth knowing if he later reconciles migration history manually.
- **Unexplained:** `CLAUDE.md` uncommitted diff, not from this session — see banner above.

---

*Closed 2026-08-06, session in progress at ~20:39 PDT — update further if work continues.*
