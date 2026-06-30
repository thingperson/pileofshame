# Web ↔ iOS interoperability — getplaying's half

*Captured 2026-06-30 from the iOS handoff `inventory-full → getplaying: web-ios-interop`. Brady green-lit decisions D1–D6 on the iOS side 2026-06-30. **Most of the work here is web + Supabase — getplaying is product source of truth.** The iOS repo owns its client half + the shared contract reference impl. Full plan in the iOS repo: `~/Desktop/inventoryfull-ios/notes/web-ios-interop-plan.md`.*

> Status: **SPECCED / not started.** D1 + D3 are hard prerequisites for the iOS prod launch. This is a multi-session backend initiative touching prod Supabase and the locked data model (localStorage authoritative, Supabase opt-in sync) — schedule deliberately, don't start blind.

---

## D1 — Server-authoritative merge (BLOCKING the iOS prod launch)

**The bug:** this repo blind-overwrites the entire `library_data` blob on save — `lib/cloudSync.ts:13-25` does a raw upsert; `components/CloudSync.tsx:60` resolves conflicts with whole-blob last-write-wins on `lastSaved`. No per-game or server-side merge exists. iOS does a careful per-game merge (reconcile by game `id` + `updatedAt`). **Pointed at the same prod backend, a stale web save silently deletes games the other client added** (and vice-versa). This is the root cause of the "merge bug drops web-only `category`/`priority`/`installed`" warning in the deep-read §D.

**Agreed fix:** a Supabase Postgres function / RPC `merge_library` that does an atomic read-merge-write — reconcile games by `id` + `updatedAt`, union `categories`/`customVibes`, take newest `settings`/`lastSaved`. BOTH web and iOS call it instead of a raw upsert. Server transaction = no lost-update race.

**Don't design from scratch — port the hardened+tested iOS impl:**
- Reference impl: `inventoryfull-ios/InventoryFull/Sync/LibraryMerge.swift` — includes the ownership-aware "unowned-key rescue" so unmodeled fields (`category`/`priority`) survive (iOS decision D-030).
- Golden test vectors: `inventoryfull-ios/InventoryFullTests/LibraryMergeTests.swift` — the Postgres/TS port must satisfy these exact cases.

## D4 — Soft-delete tombstones in the shared contract
Merge is union-only today → a game deleted on one client reappears from the other. Add a per-game soft-delete marker (e.g. `deletedAt`) so deletions converge. Must land in the `library_data` contract on BOTH sides in lockstep. Decide a tombstone retention window.

## D2 — Auth provider alignment
Web offers magic-link (OTP) + Google + Discord (`lib/useAuth.ts:103,115,126`). Agreed app-wide set: **magic-link + Google + Discord + Sign in with Apple** (Apple mandatory on iOS once social login is offered; web keeps magic link for email-only users). iOS drops email/password (dev-only). **Web change:** add Apple as a provider so an Apple-created account is recognized on web.

## D3 — Identity linking (BLOCKING — stop the account-fork)
No linking logic in this repo (`app/auth/callback/route.ts` just exchanges the code). Same person via two providers forks into two `user_id`s → two libraries. Agreed:
- Turn on Supabase "link identities with the same VERIFIED email" (verified-only, anti-takeover).
- Add an explicit "this email already has an account — link it?" flow (`supabase.auth.linkIdentity`), since Discord may not return a matching verified email.

## D5 — Account consolidation (Phase 2, non-blocking)
Brady's own data is fragmented (Steam→`superbrady`, PS→`bradywhitteker`, etc.). A one-time merge-accounts flow (= the per-game merge across two users' libraries). After the above lands.

## Connection-persistence bugs (web side, verify + fix)
- `linkedSteamId` is **dropped on cloud save** (`components/CloudSync.tsx:98-104` omits it) — a connected-Steam signal never reaches another device. Round-trip it. *(Caveat: fixing this in isolation is still lost-update-raced until D1 lands — sequence with the merge work.)*
- PSN/Xbox connections **aren't persisted on the account** (one-shot imports). For account-level connections across clients, add a `connections` table (`user_id, platform, external_id, handle, token?`) rather than burying state in the blob. *(Tokens stay ephemeral per the PSN rule — `token?` only if it's a non-secret handle, never raw creds.)*

## UX copy (web-first, iOS mirrors)
No copy states "login is separate from connecting platforms." Add an explainer at sign-in + connect: *"One account. Sign in any way; it's separate from your game libraries — your login email doesn't need to match your Steam/Xbox/PSN account."* (Run through voice-charter before shipping.)

## Naming alignment (web side owns this)
Product name is locked **Inventory Full**; web artifacts carry legacy names (map: `inventoryfull-ios/notes/canonical-names.md`):
- `gh repo rename thingperson/pileofshame → inventoryfull-web` (GitHub auto-redirects). *(No `gh` CLI here — Brady does this in the GitHub UI.)*
- Rename Supabase **prod** project display name `Pile Of Shame → Inventory Full` (display only; ref/URL/keys immutable, no code impact). Brady in dashboard.
- Folder `~/Desktop/getplaying → inventoryfull-web` is **DEFERRED** (high path-breakage — do it with no live session in the folder + sweep absolute-path refs; note this settings.json + the SessionStart hooks hard-code `/Users/bradywhitteker/Desktop/getplaying`).
- Check Vercel project name → `inventory-full`.

## Dev/prod hygiene (noted)
Web develops/tests against the **prod** Supabase project (`NEXT_PUBLIC_SUPABASE_URL` = prod) — test accounts (e.g. `brady@slant.is`) sit in prod alongside real customers. Consider using the dev project (`xafdnhsuiygbsfuqtdav`) for web dev so testing stops polluting prod.

---

## Sequencing
D1 (convergence) + D3 (identity) are hard prerequisites for the iOS prod flip. iOS is ready to call `merge_library` and mirror auth/UX once the web/backend half lands. **When the RPC + contract changes are live, ping back via a handoff addressed to `inventory-full`** so iOS wires its client side.

## Legal/privacy gates this triggers
- New Supabase `connections` table and any server-side identity-linking = new data categories server-side → **Privacy Policy update before shipping** (legal-compliance.md).
- Tokens stay ephemeral, never persisted server-side (hard line #4).
