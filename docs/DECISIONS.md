# Decisions log

This file captures the **why** behind load-bearing decisions on Inventory Full. It is not a changelog — `git log` already does that. The goal is for future-Brady (and future-Claude) to reverse-engineer intent when a piece of code looks weird six months from now.

## How to use this file

- Append-only, reverse chronological (newest at top).
- One entry per decision. Keep it tight.
- Capture the **why** and what was **rejected**, not just what was chosen. The rejected alternatives are often more informative than the winner.
- Link to the commit or file if it helps, but don't duplicate the diff.
- It is okay to write an entry a few days after the fact. Better late than never.
- If a decision gets reversed later, don't delete the old entry — add a new one that supersedes it, and link back. The reversal reason matters too.

This doc is a starting point, created 2026-04-09 from what was fresh in the current session. Older decisions can be backfilled as they come up.

---

## 2026-06-29 — Play→Resume label: simplified version shipped, full platform matrix deferred

**Decision.** The launch button now shows "Resume on [Platform]" when `hoursPlayed > 0`, "Launch in [Platform]" otherwise. The original modal-redesign-spec.md Item 2 called for a full platform×device matrix with new `Game` type fields (`psnTitleId`, `epicAppId`, `gogAppId`, etc.) and ~340 LOC of dispatch logic in `lib/launch.ts`.

**Why.**
- The label change delivers the continuity signal at near-zero cost and no enrichment pipeline dependency.
- The full matrix requires enrichment pipeline changes to populate new platform ID fields. PSN and Epic/GOG IDs are not in the current import flow — shipping the matrix now would be dead code for 90% of the library.
- Deferred until enrichment work makes the platform IDs reliably available.

**Implementation.** `resumeLabel` added to `LaunchTarget` interface in `lib/launch.ts`. `GameCard.tsx` picks `resumeLabel` vs `label` based on `game.hoursPlayed > 0`.

**Drift risk.** The full platform matrix spec in `docs/modal-redesign-spec.md` Item 2 (original) describes the intended end state. Don't re-design from scratch when the time comes — read that spec first.

---

## 2026-06-29 — "More like this" placement: celebration modal only

**Decision.** The "From your shelf" similar-games section lives in `CompletionCelebration`'s celebrate stage, not in `GameCard` as the original spec suggested. It fires on Completed status only, not Moved On.

**Why.**
- Amabile & Kramer (Progress Principle): the post-completion moment is when commitment to the next game is most likely. The celebration modal is that exact moment.
- Moved On excluded — surfacing alternatives immediately after bail risks reading as guilt-tripping, undermining the "Moving on is deciding too" canon.
- GameCard placement would require extracting `findSimilar` to a lib file and plumbing it through more surfaces. Celebration-only is simpler and psychologically better-targeted.

**Implementation.** `findSimilar()` helper defined inline in `CompletionCelebration.tsx`. Jaccard genre overlap, eligibility filter `status in (buried, on-deck)`, limit 3. Tap → `updateGame(id, { status: 'on-deck' })` + toast.

**Rejected.** Persistent "Find similar" link on all game card detail views — adds discovery surface but re-introduces choice at the wrong moment (Iyengar).

---

## 2026-06-29 — Share card auto-creates on mount (preview-first)

**Decision.** `GameClearShare` now calls `/api/share` via `useEffect` on mount, creating the share record in the background. The URL is ready before the user looks at the share section. The "Create share link" button is eliminated.

**Why.**
- Proposal D (preview-first) was the UX goal. Auto-creation on mount is the minimal implementation that achieves it without a separate preview endpoint or client-side render.
- The original flow (configure → create → see) required 3 clicks to get a shareable URL. Now it's 1 click (expand share section → URL already there).
- Trade-off accepted: every time a user opens the share section, a DB write fires even if they never copy the link. Acceptable given low completion volume and Supabase free-tier headroom.

**Implementation.** `handleCreateCard` converted to `useCallback`, called in `useEffect([], [])` in `components/CompletionCelebration.tsx`. Failed state shows a Retry link inline. No toast on failure — silent retry is less disruptive in the post-celebration context.

**Rejected.** Showing a static visual preview before creation — would need a `/api/og-preview` endpoint or client-side OG card renderer. Deferred; auto-create achieves the same outcome without the complexity.

---

## 2026-06-17 — Light-theme accent colors via `var(--stat-*, <dark fallback>)`

**Decision.** Light-theme WCAG AA pass. Accent colors (stat numbers, archetype/tone badges, platform tags, the value-calculator button) were hardcoded dark-theme Tailwind hexes (`#22c55e`, `#a78bfa`, `#38bdf8`, platform blues, etc.) applied as inline styles / props, so they washed out to ~2:1 on light theme's pale cards. Fixed by introducing accent CSS variables — `--stat-green/amber/violet/sky/slate/red` and `--src-steam/playstation/epic/xbox/switch/gog/other` — referenced as `var(--stat-green, #22c55e)`. The fallback is the original dark hex, so the default/dark theme is **byte-for-byte unchanged**; only `.theme-light` (and other light-ish themes, if extended later) overrides the vars to AA-passing `-700` shades. Token text (`--color-text-dim/faint`) was also darkened in `.theme-light`. Result: stats page went from many failures to **0 contrast failures**; the "What's your library worth?" button went 1.2:1 → 5.84:1 (it was white text forced onto a pale gradient by the over-broad `button[style*="linear-gradient"]{color:white}` rule, now narrowed with `:not(.light-gradient-btn)`).

**Why this pattern (vs. per-theme component logic or utility overrides).**
- Var-with-fallback means **zero risk to dark theme** and no `useTheme()` branching in components — the cascade does the work.
- It's the cleanest extension of the file's existing `.theme-light` override approach.

**Gotcha discovered (load-bearing — don't repeat the debug).** Tailwind v4 `@theme` here generates `text-text-*` color utilities, but `.theme-light .text-text-faint`-style override *rules* get stripped/ineffective via Lightning CSS, AND the utilities don't reliably pick up the runtime `--color-text-*` var override. The author had already worked around this for `text-text-primary`; this pass extended the same `.theme-light .text-text-{secondary,muted,dim,faint}` overrides. Separately: the **preview MCP's `getComputedStyle` returns stale color reads** — verify CSS/contrast changes with screenshots, not computed-style scans (cost a large token detour this session; logged to memory).

**Rejected.** (1) Per-component `useTheme()` color switching — more code, more risk. (2) Blanket `.theme-light` utility overrides only — doesn't reach inline-styled accents. (3) Editing dark-theme hexes directly — would have regressed the default theme.

## 2026-06-17 — iOS Steam OpenID realm hosted on inventoryfull.gg

**Decision.** Added a passthrough route at `/steam-return` ([app/steam-return/route.ts](../app/steam-return/route.ts)) that 302-redirects Steam's OpenID return into the iOS app's custom scheme (`inventoryfull://steam-callback?<openid params>`), so the iOS app can set its OpenID realm/`return_to` to `inventoryfull.gg` instead of the Supabase Edge Function (`xafdnhsuiygbsfuqtdav.supabase.co`). The Supabase function stays in place as a fallback.

**Why.**
- Steam's sign-in consent screen displays the realm domain. A `supabase.co` URL read as untrustworthy to users; `inventoryfull.gg` is the trust win.
- The route is pure and secret-less — no Steam Web API key, no user data touched. It only forwards the `openid.*` params.

**Implementation.** Hand-built `Response` with `status: 302` + `Location` + `Cache-Control: no-store`, because `NextResponse.redirect()` rejects non-http(s) URLs (custom scheme). Commit `db6cccf`. Verified live on prod. iOS side flips `SteamConfig.returnURL`/`realm` in a one-line change (realm = bare origin `https://inventoryfull.gg`, no path).

**Rejected.** Keeping the Supabase function as the sole realm (untrustworthy consent-screen domain); `NextResponse.redirect()` (rejects the custom scheme).

---

## 2026-06-17 — Steam import: "Sign in through Steam" (OpenID 2.0) as the primary flow

**Decision.** Replace paste-your-SteamID as the *default* Steam import with "Sign in through Steam" using Steam OpenID 2.0 — the standard one-tap Steam auth. The manual paste path (vanity / profile URL / SteamID, via `ResolveVanityURL`) stays as a collapsed fallback. Brings the web in line with the iOS app, which shipped this approach first.

**How it works (so future-us doesn't re-derive it):**
- Steam offers **only** OpenID 2.0 for third-party sign-in. No OAuth2, no scopes, no access token. You can't read a private library with it — it only proves identity.
- New route `app/api/steam/openid/route.ts` does double duty on one URL:
  1. No `openid.*` params → builds the `checkid_setup` redirect to `https://steamcommunity.com/openid/login` (`realm`/`return_to` = our origin, `identity`/`claimed_id` = `identifier_select`).
  2. `openid.mode=id_res` → re-POSTs every param back with `mode=check_authentication`, requires `is_valid:true`, then extracts the 17-digit SteamID64 from `claimed_id`. **The claimed_id is never trusted until check_authentication passes** — this is the whole security model; skipping it lets anyone forge a SteamID.
- The Steam **Web API key stays server-side** (`STEAM_API_KEY` in `app/api/steam/route.ts`). OpenID is keyless, so it doesn't touch the key. After verification, the existing `GetOwnedGames` fetch is unchanged.
- **Return UX = popup + `postMessage`, with a robust full-page-redirect fallback.** The callback page messages the verified SteamID to the opener window and closes. If popups are blocked (detected: `window.open` returns null, or window opens then dies within 1.5s), we fall back to a top-level redirect to `/?steam_openid=<id>` — which `app/page.tsx` parses to reopen the import hub straight into the Steam importer (`ImportHub autoSteamId` → `SteamImportModal initialSteamId`). Top-level navigation is never blocked, so the fallback always works.
- **Public game-details is still a hard limit.** OpenID identifies the user but grants no access to a private library. Empty/failed fetch routes to a dedicated guidance step with a deep link to Steam privacy settings (`https://steamcommunity.com/my/edit/settings`) and a retry. This constraint is unchanged and unsolvable — it's Steam's, not ours.

**Why popup-first over full-redirect-first.** The popup keeps the SPA and modal state intact (no reload), which is the nicer UX. Full redirect is more robust but reloads the app. We get both: popup as primary, redirect as the auto-fallback only when blocked. (localStorage is authoritative, so even the redirect path loses nothing.)

**Privacy.** No new data category and no new third party — we already stored `linkedSteamId` and called Steam APIs. OpenID only changes *how* we obtain the SteamID (verified sign-in vs. paste), and the user authenticates on Steam's site, so we never see their password. `app/privacy/page.tsx` updated anyway (Steam section + date) to describe the sign-in explicitly, to keep disclosures ahead of behavior.

**Rejected alternatives:**
- OAuth2 / access tokens — don't exist for Steam. OpenID 2.0 is the only option.
- Full-page redirect as the *primary* flow — works, but reloads the app on every import. Demoted to fallback-only.
- Dropping the manual paste path entirely — kept as a fallback for edge cases (popup + redirect both failing, privacy-tooling blocking the handshake, power users who already know their ID).

**Reference:** iOS `InventoryFull/Steam/SteamOpenID.swift` (auth-URL builder + claimed_id→SteamID64 parse) and its `QUESTIONS.md` #5, which flagged that `check_authentication` belongs server-side. On web the realm is a real `https://` origin, so the custom-scheme realm worry from iOS doesn't apply.

---

## 2026-05-20 — iOS app: native SwiftUI, separate repo, $9.99 one-time

**Decision.** Build a native SwiftUI iOS app in a separate GitHub repo ([inventoryfull-ios](https://github.com/thingperson/inventoryfull-ios)). Full spec at `docs/specs/ios-app-build-brief.md`.

**Key locked decisions (all 2026-05-20):**

1. **Native SwiftUI, not Capacitor.** The app has 5-6 core screens and >50% of iOS-differentiating features (widgets, Siri, share extension, OAuth, Keychain) require native Swift anyway. Capacitor would mean maintaining two languages + a bridge layer for a WebView that still doesn't feel native. Existing TypeScript codebase serves as the translation spec.

2. **Separate GitHub repo.** Different language/toolchain (Swift vs TypeScript), different deploy cadence (App Store Review vs instant Vercel), Xcode project artifacts would pollute the web repo. Specs and decisions stay in the web repo as canonical home.

3. **Full import, no game cap.** All platforms import full library on the free tier. Premium gates capabilities (intelligence layer, cloud sync, Year-in-Backlog), not library access. The 100-game cap was evaluated and rejected — "pay to access your own data" contradicts brand positioning and risks App Store backlash from the gaming community.

4. **$9.99 one-time purchase, no subscription.** The app's inverted success metric (less time in app = success) structurally conflicts with subscription retention — users who succeed stop opening the app, which is the cancellation moment. RevenueCat data shows higher-priced apps convert better (2.8% vs 1.4%). GameTrack lifetime is $99.99; we're an order of magnitude cheaper. Supplemented by a tip jar ($2.99/$6.99/$14.99 consumable tiers, post-milestone only).

5. **Apple Watch as Phase 3.** Today's Pick complication — logical extreme of the zero-time-in-app thesis. Pursue if iPhone widget adoption is strong.

**Rejected alternatives:**
- Capacitor wrapper — eliminated because static export is a project-killer with our API routes + server components, and >50% of the iOS value is native Swift anyway.
- 100-game cap on free tier — eliminated because it contradicts "we're on your side" positioning. Gaming communities are hypersensitive to artificial limits on user-owned data.
- Subscription pricing — eliminated because structural conflict with inverted success metric. Monthly renewal notification arrives exactly when users are happily playing games and not thinking about us.
- $4.99-6.99 price point — eliminated after RevenueCat research showed higher-priced apps convert better, and the target audience (100+ game owners) routinely spends $15-60 per game.

**Phasing:** Phase 0 = core app + widget on TestFlight (2-3 weeks build + 2 weeks data, kill criteria: <20% week-2 retention). Phase 1 = native features + App Store (4-5 weeks). Phase 2 = premium intelligence layer + $9.99 IAP. Phase 3 = Apple Watch + Android.

---

## 2026-05-15 — Sort Option B dropped (user self-reports progress)

**Decision.** Killed Sort Option B permanently. The feature would have added an optional "How far along are you?" (Just started / Somewhere in the middle / Almost done) field on Playing Now game cards to inform sort order.

**Why.**
- The user already tells us what they're playing via the status cycle — "Almost done" games are ones the user is actively playing and knows about. The field is informative to our sort algorithm, not to the user.
- Creates a new maintenance obligation ("now I have to update progress on 8 games") that directly fights principle #6 (less time in app = success)
- Marginal sort benefit for a field most users won't maintain
- Option A (rename "Quick to clear" → "Shortest games," sort purely by HLTB) already shipped and is honest

**Rejected.** The three-choice field (Just started / Middle / Almost done) with fallback to HLTB-only for unset games. Psychologically sound design (low cognitive load, preserves agency) but fails the "does this create a new thing to manage?" test.

**Drift risk.** Future enrichment features (HLTB progress inference, achievement percentage) might tempt re-opening this. The principle holds: we don't infer progress from data signals, and we don't ask users to maintain fields that serve our sorting over their playing.

---

## 2026-05-15 — OG image caching via Vercel CDN revalidate, not Cloudflare R2

**Decision.** Added `export const revalidate` to all 4 OG image routes instead of wiring Cloudflare R2 object storage. Root + archetype: 604800s (1 week). Clear + pile: 86400s (1 day).

**Why.**
- Investigated R2 — no Cloudflare MCP exists in the registry (the `52eafc82` connector is tldraw, not R2)
- Wiring R2 via SDK adds a new service dependency, new credentials, new failure mode
- Vercel's CDN natively caches responses with `revalidate` — same result, zero new dependencies
- Prior state was `max-age=0, must-revalidate` on all OG routes (every unfurl triggered a fresh server-side render via satori)
- Dynamic cards (clear/pile) get 1-day cache because user data can change; archetype/root are effectively static

**Implementation.** `app/opengraph-image.tsx`, `app/clear/[id]/opengraph-image.tsx`, `app/pile/[id]/opengraph-image.tsx`, `app/archetype/[slug]/opengraph-image.tsx`. Commit `2233eda`.

**Rejected.** Cloudflare R2 with cache-on-first-render pattern. Would have required `@aws-sdk/client-s3` or Cloudflare Workers SDK, R2 bucket setup, and a check-cache-then-generate pipeline in each OG route. Overkill when Vercel's built-in ISR achieves the same goal.

---

## 2026-05-15 — Share card UX overhaul scoped to approaches A + C

**Decision.** From the 4 approaches in `docs/specs/share-card-overhaul.md`, locked the build scope to A (live preview thumbnail in celebration modal, one-tap share) and C (visible share button on stats page header).

**Why.**
- A catches users at peak emotional moment — they just completed a game, dopamine is up, share intent is highest. Replaces a 3-4 click buried flow with preview + one tap.
- C makes the stats share card discoverable without excavation. Current path is 7+ clicks.
- Together they cover the two highest-intent share surfaces (completion and stats) without overscoping.

**Rejected.**
- B (share button on completed game cards) — lower urgency, "discover later" path, not a high-intent moment. Can add later if share adoption warrants it.
- D (preview-first flow everywhere) — a design philosophy that A and C already embody. Not a separate build item.

---

## 2026-05-13 — DONE_FLAVORS: separate share-card copy pool for non-finishable games

**Decision.** Added `DONE_FLAVORS` array and `pickDoneFlavor()` in `CompletionCelebration.tsx`, branching the share-card `flavorText` useMemo on `game.isNonFinishable`. Non-finishable games (MMOs, sandboxes, infinite games) get distinct flavor text ("Made my mark on {name}," "Put in the time," "Showed up for {name}. That counts.") instead of drawing from `CLEAR_FLAVORS` ("Knocked out," "Cleared," "Finished").

**Why.**
- "Cleared" framing is category-wrong for games without an end state — creates cognitive dissonance on share cards posted publicly
- The in-app celebration stage already branched on `isNonFinishable` correctly; the share card had a blind spot
- Voice charter rule: celebrate action, not just completion — applies here too

**Implementation.** `components/CompletionCelebration.tsx` lines ~207–260. `DONE_FLAVORS` has 8 variants (4 contextual, 4 evergreen). `pickDoneFlavor()` mirrors `pickFlavor()` pattern. Branch in `flavorText` useMemo adds `game.isNonFinishable` to the dep array. Commit `bcd54c5`.

---

## 2026-05-13 — Pip Discord bot: Phase 1 architecture locked

**Decision.** Built Phase 1 of Pip (the Inventory Full Discord bot) as a Node service in `bot/` subdir using `discord.js` v14, deployed to Fly.io on a 256MB shared-cpu-1x machine in sjc. Slash-commands only, no privileged intents, stateless, no database. Ships with `/pick` (single-game recommendation from a 20-game curated pool with Roll-again button) and `/archetype` (autocomplete over 40 slugs, embeds the canonical OG image from the web app).

**Why.**
- Monorepo subdir over separate repo: easier to keep `archetypeSlugs.ts` in sync with `lib/archetypeRegistry.ts`, one git history, single launch story. `.vercelignore` keeps the bot out of Next.js deploys.
- `discord.js` over `@discordjs/core`: batteries-included means weekend-shippable. We don't care about bundle size at 256MB.
- Fly.io over Cloudflare Workers: the gateway WSS connection is outbound and persistent — Workers can't hold that without rewriting to HTTP-only Interactions. ~$5/month is below the cost of refactoring.
- Curated pool seeded with 20 games hand-picked for variety/length/mood. Drafting script (`bot/scripts/build-pool.ts`, future) will pull from RAWG + HLTB for the eventual 300.
- Stateless / no DB: nothing to maintain, nothing to leak. Cooldowns deferred until abuse shows up.
- Bot named "Pip" — leverages the existing robot character in `notes/pip/`. A Discord bot literally IS a robot; the bot-vs-mascot tension flagged in `bot-character-spec.md` resolves itself.

**Implementation.** `bot/` subdir (Dockerfile, fly.toml, src/{index,registerCommands,embed,archetypeSlugs}.ts + src/commands/{pick,archetype}.ts), `.vercelignore`. Commits `b2dd60d`, `03b3dea`. Live at `inventory-full-bot.fly.dev`.

**Rejected.**
- Cloudflare Workers (HTTP-only Interactions): would have been free but required ~4hr refactor and locks out future gateway-only features (presence, reactions, voice).
- Separate `inventory-full-bot` repo: cleaner blast radius but duplicates tsconfig/eslint and breaks easy type sharing.
- Adding Redis/Fly KV now for cooldowns: premature. Add when abuse appears.
- Bot name "Inventory Full" or "get playing": both lose to "Pip" — short Discord handle (`@Pip`), uses existing character asset, the brand stays in every embed footer.

**Drift risk.** `archetypeSlugs.ts` mirrors `lib/archetypeRegistry.ts` manually. Adding archetypes upstream without updating the bot's list will silently exclude them from `/archetype` autocomplete. Regeneration recipe is in the file header.

---

## 2026-05-13 — Cozy and Future themes stashed from active rotation

**Decision.** Removed `cozy` and `future` from the theme selector, type union, and NinetiesMode render branches. CSS rules in `globals.css` left in place. Component stubs retained as comments in `NinetiesMode.tsx`.

**Why.** Theme count reduction — user feedback requested fewer themes (one dark, one light, a couple fun ones). Cozy and Future were the lowest-value picks: Future never felt finished, Cozy was visually soft but overlapped with the light theme's warmth. Dark / Light / 80s / 90s / Dino / Void is a tighter, more defensible set.

**Implementation.** Commit `ceb1bbc` + `ed32a40`. Files: `lib/types.ts` (union), `components/SettingsMenu.tsx` (commented out with stash date), `components/ThemeClass.tsx` (removed from class list), `components/NinetiesMode.tsx` (branches commented, component bodies replaced with stubs).

**To restore.** Uncomment in all four files. CSS is already there.

---

## 2026-05-13 — Light theme as default; poster theme retired

**Decision.** Flipped the default theme from `dark` to `light` in `lib/store.ts` initial state. Existing users keep their persisted preference; only new visits and import-resets land in light. Also dropped the `poster` theme from the active roster — `🎀 Poster` was sitting alongside the eight visible themes in Settings but was never validated and didn't fit the brand. Removed from `SettingsMenu.tsx`, `ThemeClass.tsx`, and the `theme` type union in `lib/types.ts`. CSS rules in `globals.css` left in place per the existing "stash, don't delete" convention.

**Why.**
- Landing page is already cream/light. Users hit the warm-cream `LandingPageV2`, click "Try a sample" or import, and previously got slammed with the dark app shell. Light → light → light is a cleaner first impression.
- Poster theme was a one-off experiment that never earned a place in rotation. Removing it tightens the user-facing theme menu without losing the underlying CSS.

**Implementation.** Commits `2a7e73f`, `5114a9b` (merge). Files: `lib/store.ts` (two default sites), `lib/types.ts` (union), `components/SettingsMenu.tsx` (commented out), `components/ThemeClass.tsx` (removed from list).

**Rejected.** Hard-flipping existing users to light too. Would have nuked everyone's saved preference for a non-emergency change — too aggressive. Persisted theme wins, default only changes for fresh visits.

---

## 2026-05-08 — Theme class application moved to root layout

**Decision.** Extracted theme class logic from NinetiesMode (which only ran on `page.tsx`) into a dedicated `ThemeClass` component in the root layout (`app/layout.tsx`). All routes now get the theme class on `<body>`.

**Why.**
- NinetiesMode lived inside `page.tsx`, so `/stats`, `/about`, and every other route never received the `theme-light` (or any theme) class. This was invisible while dark was the only theme (dark = default CSS values), but broke immediately when light theme shipped.
- The fix is a clean separation: ThemeClass handles the global concern (CSS class on body), NinetiesMode handles the 90s-specific effects (scanlines, CRT, etc.).

**Implementation.** `components/ThemeClass.tsx` (new), `app/layout.tsx` (import + render), `components/NinetiesMode.tsx` (removed duplicate useEffect + dead `THEME_CLASSES` const). Commit `ed43373`.

**Rejected.** Moving all of NinetiesMode into root layout — too heavy, it renders theme-specific UI (banners, scanlines) that only belongs on the home page.

---

## 2026-05-05 — Pre-push lint gate demoted to non-blocking

**Decision.** The blocking eslint pre-push hook (shipped in `d0d9ab1`, same day) was demoted to informational-only in `6103117`. CI remains the hard gate for lint errors.

**Why.**
- GameCard.tsx has 4 pre-existing React Compiler `preserve-manual-memoization` errors that predate the hook. These are structural (the compiler can't infer deps for a complex useCallback) and non-trivial to fix without a GameCard refactor.
- A blocking hook that fails on pre-existing errors in untouched code trains the developer to bypass it. Non-blocking nag + CI hard gate is the correct two-tier pattern for this situation.

**Implementation.** `scripts/hooks/pre-push` — lint section now prints warning and continues. Also scoped to only changed files (was running full-project lint before).

**Rejected.**
- Fix all pre-existing lint errors first — would require GameCard refactor (~1000 lines), not worth blocking feature work for.
- `eslint-disable` the specific lines — suppresses real signals, sets bad precedent.

**Drift risk.** If the pre-existing errors get fixed later, consider re-promoting to blocking.

---

## 2026-05-05 — Modal destructive-action disclosure pattern

**Decision.** In modal view, Delete and Don't Suggest live behind a "··· More actions" disclosure. Bail ("Not for me") stays at second tier, always visible without disclosure.

**Why.**
- Delete + Don't Suggest are low-frequency, high-consequence. Hiding them reduces accidental clicks and visual clutter in the action row.
- Bail stays visible because "Moving on is deciding too" is a canon moment (voice-charter.md). Hiding the primary agency-affirming exit behind a disclosure undermines the psychological work it does. The user should always see they can leave without shame.
- Closing the disclosure cancels any active confirmation state (no orphaned "Gone forever?" prompts).

**Implementation.** `components/GameCard.tsx` — `showMoreActions` state, conditional render in `forceExpanded` context. Card view unchanged.

**Rejected.**
- Disclose all three (Delete + Don't Suggest + Bail) — violates Moving On canon.
- Collapse only Delete — Don't Suggest is equally low-frequency and equally disruptive to scan past.

---

## 2026-05-05 — Similar games only fires on Completed modal

**Decision.** "From your shelf" strip renders exclusively on the Completed (`played`) game modal. Never on Backlog, Up Next, Playing Now, or Moved On.

**Why.**
- Iyengar (2000): surfacing alternatives during an active decision increases paralysis. Backlog/Up Next/Playing Now users are mid-decision — showing "more like this" reintroduces the jam-wall problem we exist to solve.
- Amabile (2011): the post-completion moment is one of few where "what next?" is welcome. The user just won. They're not paralyzed, they're satisfied. "From your shelf" channels that momentum.
- Moved On: would read as guilt-tripping ("here's what you could have played instead"). Skip.

**Implementation.** `components/GameCard.tsx` — gated to `game.status === 'played' && forceExpanded`. `lib/similarity.ts` — weighted heuristic (genre 40%, mood 25%, time 20%, metacritic 15%).

**Rejected.**
- Show on all statuses with a "you might also like" framing — contradicts core thesis (less choice, not more).
- Show on Moved On with "give these a shot" framing — too close to shaming the exit.

---

## 2026-05-05 — Playwright MCP added at project scope via .mcp.json

**Decision.** Playwright MCP wired via `/Users/bradywhitteker/Desktop/getplaying/.mcp.json` at project scope. Used `npx @playwright/mcp@latest` shape; verified package resolves cleanly. File committed (solo dev — no reason to gitignore project-specific MCP config).

**Why.**
- Visual regression loop spec (`docs/on-the-horizon.md` item 1) names Playwright as the right pixel-diff engine vs. vision-model diffing.
- CCD Connectors UI doesn't list Playwright; remote-marketplace MCPs (Sentry, Supabase, etc.) are managed by Anthropic and Playwright isn't on offer there. CCD Extensions (`.mcpb` bundles) don't include it either.
- Direct `.mcp.json` was the only path that didn't require installing Claude Code CLI globally (which hit `claude not found` after `npm install -g` attempts on Brady's fnm setup).

**Implementation.** Commit `528da01`. `.mcp.json` at repo root.

**Rejected.**
- Install Claude Code CLI to use `claude mcp add` — hit OS-level rejection during `npm install -g`, fnm shim issue suspected.
- Edit `~/.claude.json` user-scope — file has no `mcpServers` key currently; touching it risks corrupting 23KB of session state.
- Wait for CCD Connectors UI to add Playwright — no signal it's coming.

**Drift risk.** First load downloads Playwright lazily via npx (~30–60s). If that ever times out at session start, we'll see Playwright tools fail to register. Cache lives in npx local cache. CCD will prompt to approve the project-scoped MCP on next session start — must be approved or it won't run.

---

## 2026-05-05 — `/deploy` is the orchestrator, not a monolith

**Decision.** `/deploy` skill rewritten as scope-aware orchestrator. Step 1 detects what changed (user-facing / server / schema / rules / config / scripts), Step 2 picks Full vs Quick mode based on scope, delegates to `/pre-push-review` rather than duplicating voice-sweep logic. New post-push verify step (curl x-vercel-id twice, smoke-check, glance Sentry). Boundaries explicit: `/deploy` is NOT `/session-close`, NOT regress-watch decisions-audit.

**Why.**
- Pre-push gates existed but didn't reliably fire. The fix is workflow default-inclusion, not human discipline.
- Forcing every gate on every push was the wrong shape — kills velocity on docs-only or hotfix changes, trains avoidance.
- Scope detection makes the orchestrator cheap when nothing applies and thorough when it matters.

**Implementation.** Commit `fe20dab`. `.claude/skills/deploy/SKILL.md`.

**Rejected.**
- Bundle pre-push gates into `/session-close` — wrong ritual; close is end-of-session housekeeping, not push verification.
- One monolithic deploy command that runs every gate every time — bloat that gets skipped.
- CI/GitHub Actions enforcement — solo dev, no PR workflow today; new infra to maintain for marginal gain.

**Drift risk.** "Surface contradictions" step (2.5) isn't formalized as explicit branch points in the skill. If post-push verify times out when Brady walks away mid-deploy, the skill's claim is overstated — revisit if it bites.

---

## 2026-05-05 — Testing agents (A + B) shipped, with cadence

**Decision.** Two testing agents go live for Inventory Full:
- **Agent A** (forward-looking, fires on push): non-blocking git pre-push hook at `.git/hooks/pre-push` (canonical: `scripts/hooks/pre-push`) nags when user-facing code is in the diff. The same hook also runs `npm run lint` as a BLOCKING gate when TS/TSX/JS/JSX in components/, app/, lib/, hooks/ changes — lint failures block the push outright. Skill `/pre-push-review` carries the bundle (build + voice + a11y + legal).
- **Agent B** (backward-looking, fires weekly): `/regress-watch` extended with a `decisions-audit` mode. Six `decision-*` assertions encode LOCKED DECISIONS entries; weekly cron at Mondays ~08:09 AM PDT writes `docs/audits/audit-YYYY-MM-DD.md`. Surfaces drift only — never auto-fixes.

**Why.**
- Voice-sweep was skipped on a 2026-04-02 deploy because nothing enforced it. Agent A makes the gate hard to skip.
- Locked decisions silently rot when later refactors miss the rationale. Agent B catches that on a cadence Brady doesn't have to remember.
- Both lean on artifacts that already exist (rule files, DECISIONS.md); no new spec to maintain.

**Implementation.** Commits `cdc6563` (pre-push-review terminology fix), `0a16130` (Agent A hook), `59cfc48` (Agent B mode + assertions), `d0d9ab1` (lint gate), plus scheduled task `inventory-full-decisions-audit-weekly` in `~/.claude/scheduled-tasks/`. Spec: `docs/testing-agents-spec.md`.

**Rejected.**
- CronCreate (session-only) for Agent B — dies when Claude Code exits; doesn't satisfy "I won't remember to run these."
- Blocking voice/a11y in the hook — false positives during quick fixes would train Brady to `--no-verify`. Lint-only is the right blocking scope.
- One unified skill for both — different cadences, different inputs; forcing them together would muddle each.

**Drift risk.** First Agent B fire is Monday 2026-05-11; tool permissions need pre-approval via "Run now" in CCD Scheduled sidebar before then or the auto-run pauses. If false-positive rate is high after first real run, refine assertions in `.claude/skills/regress-watch/assertions.md`.

---

## 2026-05-05 — picker CTA renamed "What Should I Play?" → "Pick My Game"

**Decision.** The primary picker CTA across `app/page.tsx`, `components/Reroll.tsx` (header + dialog `aria-label`), `components/PostImportSummary.tsx`, and the `app/layout.tsx` JSON-LD feature list now reads "Pick My Game". Voice-and-tone terminology table updated to lock the new label and demote the old one to the "do not use" column.

**Why.** "What Should I Play?" frames the moment as a question the user is still answering — it puts the decision back on them at the exact moment they came to the app to be relieved of it. That's misaligned with the in-product fulfillment voice in `voice-charter.md` (landing/marketing uses "we'll help"; pick-time uses "here's your game"). Three research threads compounded:
- **Iyengar 2000** (choice overload, the jam study): under decision paralysis, more options reduce action; the right delegation is to a single pick, not "let's think about it together."
- **Brehm 1966 / SDT (Deci & Ryan 1985):** autonomy preserved by keeping the user as the grammatical subject ("Pick **my** game") instead of barking ("Decide for me" was the leading alternative — the verb is meeker and shifts subject to the app, which mildly reads as "because you can't").
- **Loewenstein 1996** (visceral-state misjudgment): the user can't reliably introspect what they want — asking "What Should I Play?" demands exactly that. Better to short-circuit it.

**Rejected alternatives.** "Decide for me" — softer verb than the rest of our CTAs, slightly subordinate. "Just pick one" — risks reading as exasperated. "We pick. You play." — locked tagline echo, but too declarative for a button. Kept "Pick My Game" because the imperative + possessive does the autonomy/delegation balance in three words.

**Supersedes.** The 2026-04-03 decision (DECISIONS.md, "What Should I Play? must dominate the main page") on label content only — the gravity/dominance principle is unchanged.

---

## 2026-05-05 — navigator.share text payload dropped from archetype share

**Decision.** `components/ArchetypeCard.tsx`'s share function passes only `{ title, url }` to `navigator.share()`, NOT a `text` field. OG metadata on the page (`og:title` "I'm The Eclectic. What's your gaming archetype?" + description with CTA) handles the unfurl preview at recipient end.

**Why.**
- Desktop browsers' native share-sheet "Copy" action concatenates `text + url` into the clipboard, producing junk like `https://inventoryfull.gg/archetype/eclectic\nI'm The Enthusiast on Inventory Full.` that breaks the link when pasted.
- The `text` field's job (telling the recipient what the link is) is now done by the OG metadata at unfurl time. Redundant.

**Implementation.** Commit `273783f`. `components/ArchetypeCard.tsx:33`.

**Rejected.** Inline the URL into the `text` field instead of passing url separately — some browsers still concatenate, doesn't reliably fix the issue across all share targets.

---

## 2026-05-04 — Pip (bot character) is NOT the Inventory Full mascot

**Decision.** The pixel-bot character introduced via ChatGPT generation gets the name "Pip" and a defined role: Discord bot avatar, occasional in-app Easter-egg appearances, future merch (mug, hat, sticker pack co-star, controller-skin giveaway prize). Pip is a **sidekick**, never elevated to brand mascot. The brand center stays "your archetype is the protagonist."

**Why.**
- Inventory Full's identity is the user's archetype-as-personality. A brand mascot competes with that — promotes us, not them. Wrong story.
- Pip works as a quiet recurring presence: shows up rarely enough that finding him feels like a discovery, not a nag. Backed by an opt-out toggle ("Hide Pip") for users who don't want even the rare appearances. Anti-shame, full user control.
- The crown-on-a-character-named-Pip joke doesn't survive elevation — once Pip becomes "official," the contrast collapses.

**Implementation.** `docs/bot-character-spec.md` (commit `8397b99`) — character bible, 23 GPT prompts for further generation, placement plan, "don't generate" list. No code changes yet; this is a brand decision, art generation continues, in-app placement happens in a future session.

**Rejected.**
- Adopt Pip as the IF mascot (most obvious move, most obviously wrong — collapses the archetype framing).
- Multiple mascots / mascot-per-archetype (defeats the single-shared-experience point of having a mascot at all).
- Loud "FANTABULOUS / HYPEBOT" framing from the original GPT mockup — wrong voice, wrong decade.

---

## 2026-05-04 — Discord bot threshold revised: build when there's time, not when community is "ready"

**Decision.** Build the Discord bot's Tier 1 (`/pick`, `/archetype`, clear-celebration webhook) when Brady has a focused 3-day window, NOT when Discord membership crosses 25 or WAU crosses 1k. Tier 2 (OAuth + library access features like `/myarchetype`, `/duel`) stays gated on 1k WAU.

**Why.**
- Original spec recommended waiting for community size. That was wrong: `/pick` is no-OAuth and works in ANY gaming Discord, meaning the bot drives members to OUR server bottom-up rather than requiring a community to amplify. Build-then-distribute, not gather-then-build.
- Total cost is much smaller than feared: ~3 days for Tier 1 MVP, $0–2/mo Fly.io hosting at small scale.
- Tier 2 still gates on real WAU because OAuth flow + cross-user library state has zero value when nobody has a library imported anyway.

**Implementation.** `docs/discord-bot-spec.md` (commit `6507c94`). Threshold logic flipped in TL;DR section.

**Rejected.** Wait for 25 Discord members (original recommendation, contradicted by the bottom-up `/pick` distribution mechanic). Skip Tier 2 entirely (OAuth features still earn their keep at scale; just not yet).

---

## 2026-05-04 — Archetype share page renders H2 PNG, supersedes lo-fi PixelSprite for that surface

**Decision.** `/archetype/[slug]` page now renders the painted-pixel H2 PNG (via `<Image src="/sprites/h2/${spriteKey}.png">`), matching the OG card. Previously rendered the lo-fi 32×32 PixelSprite, creating a visual mismatch between the in-page hero and the unfurled card. Supersedes the "hybrid acceptable per 05-02" stance for THIS surface only — in-app archetype card thumbnails (`components/ArchetypeCard.tsx`) still use lo-fi PixelSprite per the original hybrid call.

**Why.**
- The 05-03 handoff flagged "two outputs from one URL" as a rotting visual mismatch. It WAS jarring: visit the share URL, see a chibi 32px sprite; share the same URL, see the painted H2. Recipients seeing both side-by-side reads as inconsistency, not voice.
- The archetype share page is *itself* a share landing. Its job is to be the destination of an unfurl click. Visual continuity with the unfurl matters more here than internal consistency with in-app card surfaces.
- In-app card thumbnails stay lo-fi because they render at 64–96px where the lo-fi reads cleaner anyway, and the in-app context is "your library" not "your shareable identity."

**Implementation.** `app/archetype/[slug]/page.tsx` swaps `PixelSprite` import for `next/image` reading from `/sprites/h2/{spriteKey}.png`. Tone-tinted drop shadow matches the OG card's glow color. Commit `8ead582`.

**Rejected.** Swap in-app card thumbnails to H2 too (would touch every archetype display surface for marginal gain at small render sizes — separate, larger pass).

---

## 2026-05-04 — retroKids archetype trigger deferred, sprite shipped anyway

**Decision.** Of the 3 unwired H2 archetypes from the 05-03 handoff (`retroKids`, `grindGhost`, `lateBloomer`), only `grindGhost` and `lateBloomer` got triggers wired this session. `retroKids` waits for release-year enrichment to land. Sprite copied to `public/sprites/h2/retroKids.png` regardless, so wiring is a 3-line edit when the data arrives.

**Why.**
- `retroKids` was always going to be "library skews old" — owns a lot of games released X years ago. We don't store game release year (RAWG returns `released` field; we don't currently pull it through `lib/enrichment.ts`).
- Workarounds considered (Steam appid as proxy for release year, `addedAt` as "longtime user" signal) all measure something other than what `retroKids` is *about*. Better to ship nothing than ship a misleading trigger.
- `grindGhost` (200+ hr in one game) and `lateBloomer` (cleared a game owned 2+ years) trigger from data we already have. Shipped both.
- Copying the sprite to disk now (with the right filename `retroKids.png`) means the rest of the wiring is trivial when enrichment lands. Avoids re-discovering the alias at that point.

**Implementation.** `lib/archetypes.ts` adds `maxHoursInOneGame` and `lateBloomerCount` to `PlayerStats` + the two new archetype trigger functions. `lib/archetypeRegistry.ts` adds the two slugs. `SPRITE_KEY_BY_TITLE` adds both. `public/sprites/h2/retroKids.png` shipped without app-side trigger. Commits `8ead582` (wiring) + `5153d4b` (missing PNGs).

**Rejected.**
- Wire retroKids with `addedAt`-based proxy ("a lot of games owned 3+ years"). Measures user tenure, not game age — wrong concept.
- Wire retroKids with Steam appid heuristic (low appid = old game). Steam-only, breaks for non-Steam libraries, brittle.
- Wait to ship grindGhost + lateBloomer until all three are ready. They were ready; gating them on retroKids would have wasted the H2 art that's already on disk.

---

## 2026-05-02 — Archetype share architecture: static evergreen registry, not per-share DB snapshot

**Decision.** `/archetype/[slug]` pages and their OG cards render from a static registry (`lib/archetypeRegistry.ts`) of de-personalized archetype flavor lines — NOT from a per-user DB row capturing their personalized in-app description. Every visitor to `/archetype/the-archaeologist` sees the same generic "Games from years ago are still waiting for you" copy, regardless of whose share link they followed.

**Why.**
- The in-app archetype descriptions in `lib/archetypes.ts` interpolate user stats (`${s.totalGames} games, ${s.completedCount} finished`). Those numbers are stale the moment the user adds a game — and the share URL would have to be regenerated to stay accurate, which nobody does.
- Identity is the share-worthy part, not the stat numbers. *"I'm The Hoarder"* lands harder than *"I have 247 games and 4 cleared"*. The former says something about you; the latter is a leaderboard entry.
- Static = zero DB writes, zero new tables, full SSG via `generateStaticParams()`. All 38 pages pre-rendered at build time and served from CDN cache. Free, fast, and the OG image route stays Node-runtime + `fs.readFile` like `/clear/[id]`.

**Implementation.** `lib/archetypeRegistry.ts` (38 entries — title, slug, spriteKey, tone, evergreen flavor lifted from in-app descriptions with stat interpolations stripped). `app/archetype/[slug]/page.tsx` + `opengraph-image.tsx` (commits `490157c`, `5643774`). `findArchetypeByTitle()` maps in-app archetype titles to registry slugs; "Genre Addict" dynamic archetypes route to a generic `/archetype/genre-addict` page.

**Rejected.**
- DB-backed per-share snapshot mirroring `/clear/[id]` (`share_cards` table). Costs a write on every share, requires GC, makes URLs ephemeral, and gains nothing because the personalized stat numbers are not what makes the share interesting.
- Personalized OG via query string (`/archetype/hoarder?games=247`). URL parameters expose user data per `<user_privacy>` (would also pollute analytics), and the personalized framing competes with the identity framing for what the recipient takes away.

**Drift risk.** If new archetypes are added to `lib/archetypes.ts` without corresponding entries in `archetypeRegistry.ts`, the in-app share button silently doesn't render (no slug match → no share URL). Counter: a CI check that verifies every `SPRITE_KEY_BY_TITLE` title has a registry entry would catch this. For now, the convention lives in the comment block at the top of `archetypeRegistry.ts`.

---

## 2026-05-02 — H2 sprite integration: hybrid (Option C), aliases resolved at copy-time

**Decision.** Per the `docs/h2-archetype-integration-spec.md` recommendation, OG share cards use H2 PNG@4x via `fs.readFile` (Node runtime); in-app sprite renders stay on the lo-fi 32×32 sprite-string system (`lib/pixel/sprites.ts`). Three alias keys (`quickDraw` / `cozy` / `dino` in app vs. `speedrunner` / `cozy-craver` / `dino-rider` in bundle) are resolved by copying the bundle PNG to the app-keyed filename in `public/sprites/h2/` — NOT via a runtime alias map.

**Why.**
- Hybrid was the spec's recommended path. OG cards benefit from the painted-pixel detail (large render, recipient-facing, social-feed crucial); in-app thumbnails are 64–96px where lo-fi reads cleaner anyway, and re-painting all in-app sprite usages is a separate, larger surface to test.
- File-naming as the alias mechanism is the simplest invariant: `ls public/sprites/h2/` shows whether `quickDraw.png` exists. If it does, the system works. Runtime alias maps hide the mapping behind indirection that future-Brady (or future-Claude) would have to reverse-engineer.
- Visual mismatch between in-app card and OG card is acceptable because (a) the user will rarely see both side-by-side, (b) each renders well in its own context, (c) "jank is a voice" — Brady's call.

**Implementation.** 38 PNGs copied from `notes/Inventory Full-claude code resume package from design/bundle-archetype-h2/{bundle-key}/archetype-{bundle-key}@4x.png` to `public/sprites/h2/{app-key}.png` (216K total). `app/archetype/[slug]/opengraph-image.tsx` reads the PNG by app sprite key, base64-encodes it as a data URL, and renders inline at 380×380 with `imageRendering: pixelated` (commit `5643774`).

**Rejected.**
- Option A (PNG drop-in across all surfaces) — bigger surface, more places to break, no benefit for the in-app thumbnail use case.
- Option B (sprite-string runtime with extended palette) — defeats the painted-pixel quality the H2 set was made for; rendering 24-color hand-shaded art via per-pixel `<rect>` lists in satori would be slow and visually flat compared to the source PNG.
- Runtime alias map (`H2_ALIASES` record) — adds a layer of lookup that's only there to bridge a naming mismatch, when renaming the destination file accomplishes the same thing with one less indirection.

**Drift risk.** If new H2 sprites land in the bundle with names that don't already match an app key, the copy needs to be re-run with the new mapping. The `PAIRS` array in the original copy script (in commit `5643774` body) is the source of truth for the mapping but isn't checked in. If the H2 set expands, save the script to `scripts/copy-h2-sprites.sh` so the mapping is reproducible.

---

## 2026-05-01 — GA4 dataLayer init moves to root layout `<head>`

**Decision.** The GA4 dataLayer init + `gtag('config', GA_ID)` runs as a synchronous inline `<script>` in `app/layout.tsx` `<body>` top, BEFORE hydration. The `gtag.js` library load itself remains consent-gated in `CookieBanner.tsx`.

**Why.**
- GA4 silently drops events queued in `dataLayer` before `gtag('config')`. With init inside CookieBanner using `strategy="afterInteractive"`, any tracker called from a useEffect (e.g. `trackLandingView` on LandingPage mount) queued an event into dataLayer *before* config arrived. When `gtag.js` processed dataLayer, the event had no destination property and was dropped.
- Symptom: `landing_view` had "No stream data detected" in GA4 admin Events for 28 days, while `reroll`/`picker_opened` (which fire after user interaction, well after init has run) appeared normally.
- Privacy stance unchanged: pre-consent, the inline init script only creates an in-memory `dataLayer` array and a queue function. No cookies, no requests. Actual `googletagmanager.com/gtag/js` library still loads only after explicit consent.

**Implementation.** `app/layout.tsx` (inline `<script dangerouslySetInnerHTML>` in `<body>` top, commit `7eaa02f`); `components/CookieBanner.tsx` (only `gtag.js` src `<Script>` remains consent-gated). `lib/analytics.ts` retains a defensive lazy-stub for `window.gtag` in case the order is ever inverted again.

**Rejected.**
- Keeping init consent-gated in CookieBanner — the original setup. Failed because afterInteractive timing made early events undeliverable.
- React-side stub creation in `lib/analytics.ts` gtag wrapper alone (commit `629919d`). Helped queue events, but didn't fix the underlying *order* bug — config still arrived after the queued event.

**Drift risk.** A future contributor could move the inline init script into a client component or wrap it in a consent gate, reintroducing the timing bug. The comment block in `layout.tsx` explains why it can't move. If consent rules change so the dataLayer queue itself is forbidden pre-consent, this approach needs revisiting (would require deferring all early trackers via a consent-change event listener instead).

---

## 2026-05-01 — Sample library mood/tier floors

**Decision.** The sample library must satisfy two floors before ship: (1) every `MoodTag` has ≥ 5 games at the raw-presence level, and (2) every `(reroll mode × mood)` intersection has ≥ 3 eligible games. No dead-ends — every mood pick under any mode must return at least one game with reasonable variety.

**Why.**
- Pre-expansion audit (39 games) found `story-rich × Quick Session = 0 eligible` (literal dead-end — empty state for new visitors), `brainless = 1 game`, `competitive = 1 game`. Niche moods returned the same game on every roll because the eligible pool was 1.
- Without floors, niche mood picks degrade to repetitive same-game loops or empty states — exactly the failure mode the picker is supposed to remove (Iyengar choice-overload becomes Iyengar zero-choice frustration).
- Two-floor rule (raw + intersection) catches two distinct failure shapes: thin mood overall, AND thin tier-within-mood that the raw count alone misses.

**Implementation.** `lib/sampleLibrary.ts` expanded 39 → 63 games (commit `32e654d` + Hades II in `eb7bc29`). Verification harness at `/tmp/b5-mood-audit.ts` is re-runnable via `npx tsx /tmp/b5-mood-audit.ts` after any sample-library change. Post-expansion: brainless 1→10, competitive 1→6, story-rich × Quick Session 0→3, every (mode × mood) ≥ 3.

**Rejected.**
- Single raw-mood floor (Brady's initial instinct: 5 per mood). Insufficient — raw count of 5 doesn't guarantee any are Quick-Session-eligible if all 5 are marathon-tier.
- Procedurally generated sample games. Felt fake, broke the "real-person backlog" feel and the curation that gives the library its character.

**Drift risk.** Adding new MoodTags to `types.ts` without expanding sample library breaks the floor invisibly — the harness would catch it on next run, but only if someone runs it. Worth adding a CI check post-launch if mood schema continues to grow.

---

## 2026-05-01 — H2 archetype skeleton variety rule

**Decision.** Extend the H2 archetype style spec: the *art style* (24-color palette, hue-shifted shadows, no outlines, motes, brand accent) stays locked across all 42 archetypes; the *skeleton/composition* is deliberately varied per archetype. An archetype can be a humanoid, a creature, an object, an environment, or an atmospheric scene — whichever reads its concept best. The original Hoarder/Critic/Speedrunner/Cozy/Webmaster pattern of "frontal humanoid + prop" is now one option among many, not the default.

**Why.**
- First three new builders (Pure Collector, Optimizer, Wishful Thinker) all defaulted to the templated pose and felt repetitive. Brady flagged it.
- Reshape with structural variance (vitrine, top-down workspace, atmospheric-with-tiny-figure) immediately read as more distinct without losing family resemblance.
- 41-sprite set now spans top-down, action, side-profile, POV-macro, building-as-character, creature, glitchy-digital, abstract-pattern, silhouette-cutout, and back-view skeletons. Cohesion holds via palette/lighting/atmosphere, not pose.

**Implementation.** `notes/Inventory Full-claude code resume package from design/archetypes-hifi.js` (41 builders) and bundle at `notes/.../bundle-archetype-h2/`. Live integration spec at [docs/h2-archetype-integration-spec.md](h2-archetype-integration-spec.md) — not wired into app yet.

**Rejected.** Keeping the templated humanoid recipe as default and varying only props — produces visually similar set, fails the "same artist, but doesn't all look like the same person" test.

**Drift risk.** A future builder pass could regress to "easy default = humanoid in front of prop." Counter: when adding archetypes, list 2–3 candidate skeletons before committing, and bias toward non-overlapping shapes vs. existing 41.

---

## 2026-04-28 — Landing partial restoration: trust-build sections back, long pitch stays at /about

**Decision.** The Apr 25 full-trim (`ce5fc7d`) of the landing marketing narrative is partially reversed. Two sections come back to landing: "It's really just three things" (Import → Match → Play) and "Not another backlog tracker" (anti-cataloguing one-liner). The pull quote ("your backlog should feel exciting...") and "4 ways to pick today's game" stay on /about.

**Why.**
- The Apr 25 trim was logically defensible (less time in app = success, /about already had the same content) but went too far — hero + CTA alone read gutted, not focused. Brady review on prod flagged the gap on both mobile + desktop.
- The two restored sections are trust-build, not pitch. "Three things" names the loop in three steps so first-time visitors know what they're buying into before clicking Import. "Not another tracker" positions us against the obvious-adjacent category in one beat.
- The pull quote and "4 ways" are product-detail concerns, not landing-funnel concerns — they belong on /about.

**Implementation.** `components/LandingPage.tsx` — restored the two sections from `app/about/page.tsx` (byte-identical JSX), added the `StepCard` sub-component back. Comment block at the section gap flags the partial restoration. Commit `2a76716`.

**Rejected.**
- *Restore everything from the Apr 25 trim.* Would re-bloat landing and re-create the duplicate-with-/about problem the original trim solved.
- *Leave landing hero-only and rely on the "Open app" CTA bar to carry the visitor.* What Brady saw on prod after the trim — gutted, unfinished. Failed the eye test.

**Drift risk.** /about and landing now duplicate the two restored sections byte-for-byte. Edits to one need to mirror to the other. `StepCard` exists in two places (LandingPage.tsx + about/page.tsx) — fine for now, candidate for shared component if a third use appears.

---

## 2026-04-27 (PM) — Pivot: "Energy" → "Session Length" as the second pick-flow input

**Supersedes the earlier 2026-04-27 entry below ("Energy replaces time").** The substitution stands as a *concept* — the picker should ask about state-at-pick-time, not impose a clock estimate — but the *content* of that input is changing back toward time, framed as session length.

**Why the pivot.** The PDF ingest from `docs/psychology-research-ingest-2026-04-27.md` confirmed the research debt the earlier entry flagged. Two specific findings did the work:

- **Loewenstein 1996 (p. 272–275):** visceral states are systematically misjudged by introspection. Asking users to self-report "energy" leans on exactly the introspection people are bad at.
- **Mischel & Shoda 1995 (p. 249–251):** global self-categorization predicts behavior poorly (r ≈ .47 only for *if-then situation signatures*, not *dispositional levels*). "I'm low energy" is a dispositional self-categorization. It's the wrong question.

Brady's read on the implication, locked in conversation: *"people can't quantify their own energy. that's understandable. they probably are more likely to be able to say 'i can play for 2 maybe 3 hours'. that's more tangible and it tracks."* Tangible commitment estimate > internal state introspection. Session length is what the user can answer.

**New tier system (locked).**
- **Small** — ~20 min. "I've got a few minutes."
- **Medium** — ~1–2 hrs. "I've got an evening."
- **Large** — 2+ hrs · *I'm in*. Owns the time without flinching, no shame-adjacent "don't ask why" framing. Reads as commitment, not concession.

**Why "2+ hrs · I'm in" specifically.** Earlier draft was *"2+ hrs (I've got time, don't ask why)"*. Read aloud and against the voice charter: the parenthetical implies the user is bracing for judgment about their free time, which makes them the punchline of their own roast. Voice charter: *"in on the joke WITH the user, never AT them."* `I'm in` is two beats, declarative, matches the picker's `Let's go` voice. Locked.

**What stays from the earlier entry.**
- The 2-input ceiling (mood + the second axis). Unchanged.
- HLTB-derived session length is still in the data — under the hood, the picker uses it to filter out 60-hour RPGs when the user picks Small. This is now a tighter coupling than before: the user is *directly* answering "how long," not "what energy."
- The principle that mood does work the second axis can't (filters by *experience*, not by *commitment*). Mood + session-length covers both dimensions cleanly.

**Implementation track (next session).**
- Rename `EnergyLevel` type → `SessionLength` in `lib/reroll.ts` + downstream call sites.
- Update picker UI labels in `components/Reroll.tsx` (energy drawer → session-length drawer).
- Update `.claude/rules/user-psychology.md` §3 note to reflect the pivot (currently says energy is locked; needs to say session-length is locked).
- Telemetry: existing events don't carry an energy dimension yet; if/when added, use `session_length: 'small' | 'medium' | 'large'` not `energy_level`.

**Rejected.**
- *Keep energy and add session-length as a 3rd axis.* Breaks the 2-input ceiling. Hard no.
- *"2+ hrs (I've got time, don't ask why)".* Voice-charter fail; shame-adjacent.
- *Revert all the way to "time" as a clock estimate ("how long do you have?").* Same problem the energy substitution was trying to solve — users can't reliably say "I have 47 minutes." Session-length tiers preserve the original substitution's user-friendly framing while restoring the empirical grounding.

**The honest framing of how the research resolved.** Brady's read, recorded for future-Brady context: *"research did not resolve unfavorably. it resolved. it clarified our approach and tested our assumptions the right way."* The PDF ingest is doing exactly the job the redteam audit flagged it for — surfacing where shipped product is unsupported by its claimed research base, in time to adjust before launch.

---

## 2026-04-27 — Share-card content lockdown + Practical Value layer (Berger STEPPS)

**Decision.** The share composer goes from "user customizes what's on the card" to "card is what it is, no customization." Two reasons: research-grounded (the psychology ingest flagged share cards as Social Currency only, no Practical Value, which means launch-spike not flywheel), and brand-grounded (a share card is a self-expression artifact, not a stat dashboard the user curates).

**What's on the standardized card (locked).**
- **Archetype** — name + behavior line. The persona summary is shareable; it's identity, not finance.
- **Reclaimed value, framed as a plus** — "$N reclaimed" not "$N unplayed" and not "pile worth $N." If the user has reclaimed value, it shows. If they haven't yet, that field is omitted, not zero-filled. No shame surface area.
- **Brand mark + URL** — `inventoryfull.gg`, the lockup, that's it.

**What's NOT on the card.**
- Pile dollar value (private; reveals spending behavior).
- Hours wasted / hours unplayed (shame surface).
- User-configurable text fields (defeats the lockdown).
- Per-share customization controls in the composer.

**Practical Value layer (Berger STEPPS — what makes the card useful to the recipient, not just signaling for the sender).**

Berger's STEPPS framework: cards that hit Social Currency only (sender-benefit) decay; cards that hit Practical Value (recipient-benefit, useful info) compound. Our cards currently do Social Currency well, Practical Value not at all.

**Plan, two phases.**

**Phase 1 (ships first — the simplest layer):** every card carries a generic recipient-facing CTA on the footer. Working copy: *"Find out what your pile is worth → inventoryfull.gg/stats"* — invites the recipient into a self-discovery action they can take cold. Self-contained, no per-card customization, scales to every share. This is *Plan #3* from the conversation.

**Phase 2 (later, conditional on enrichment richness):** game-completion cards include a one-line "worth it if X" recommendation auto-generated from the cleared game's metadata. Example: *"Brady cleared Disco Elysium. 30hr deep RPG, slow burn, worth it if you can carve the time."* This is Plan #1 from the conversation. Skipped for now because the auto-write needs reliable session-length + tone signal we don't have on every game yet.

**What this means for the composer.** The customization controls in `CompletionCelebration.tsx` (lines 223–491 per the round-2 audit) come out, replaced by a fixed-content card with the standardized fields above and the Phase 1 footer CTA. The composer becomes opt-in (round-2 finding stands) — a "share this clear" button that opens the card preview, not a always-visible mid-celebration surface.

**Rejected.**
- *Let users edit fields per-share.* The lockdown intent is precisely this: standardize the artifact so it carries recognizable brand language, not 10,000 idiosyncratic versions.
- *Skip Practical Value entirely; ship Social Currency only.* Berger's framework is empirical, not aesthetic — Social-Currency-only cards decay after the novelty cohort. Worth the lift to add the recipient-facing CTA.
- *Phase 2 first.* The auto-write is the highest-impact version but it needs game-metadata signal we don't reliably have. Phase 1 footer CTA captures most of the Practical Value upside at a fraction of the engineering lift.

**Evidence.** `docs/psychology-research-ingest-2026-04-27.md` Berger section. Round-2 redteam audit flagged the composer placement; this entry adds the content lockdown alongside the placement fix.

---

## 2026-04-27 — "Energy" replaces "time" as the second pick-flow input

**Decision.** The locked 2-input pick flow is now **mood + energy**, not mood + time. The shift was already in the shipped code as of the picker rebaseline; this entry documents the why so it doesn't get relitigated, and names the research debt the substitution carries.

**Why.**
- Users with full pile and zero time-pressure ("I have all weekend") still couldn't pick. Time-tier wasn't the load-bearing variable for the paralysis we built the app to solve.
- "Energy" maps to the visceral state at pick-time. The user knows whether they want a brain-off 20-minute roguelite run or a slow story they can sink into; they often don't know whether they "have 20 minutes or 2 hours."
- HLTB-derived session length is still in the data — the picker uses it under the hood to filter out 60-hour RPGs when energy is "low." We didn't lose time as a signal; we moved it from a question we ask to a constraint we apply.

**What this means in practice.**
- AGENTS.md axiom #4 now reads `(mood + energy)`. The 2-input ceiling is unchanged; the *content* of the second input changed.
- `.claude/rules/user-psychology.md` §3 updated with the substitution and the open research question.
- The picker UI uses energy pills (Low / Medium / High) collapsed into a drawer. The default visible state is still 2 inputs (mood + a roll button); energy is one tap away.

**The research debt.** Cognitive-load research (Sweller) grounds the *number* of inputs, not the *content*. Whether self-reported energy predicts behavior reliably is a different question. Loewenstein 1996 ("Out of Control") and Mischel & Shoda 1995 are under ingestion 2026-04-27 to fill this gap. Possible outcomes:
- Loewenstein supports visceral-state framing → energy is correctly preferred over time. Lock it.
- Mischel & Shoda show self-reported state is unreliable → both energy AND time are weak signals. Picker may need to lean harder on inferred features (last played, recent completions, archetype fit) and reduce explicit user input further.
- Mixed or contradictory → write a follow-up entry with the new framing.

**Rejected.**
- *Keep both time and energy as separate axes.* Adds a 3rd input, breaks the 2-input ceiling. Hard no per the cognitive-load rule.
- *Keep time only.* Doesn't solve the paralysis case where time isn't the bottleneck (the most common user-reported bottleneck).
- *Replace mood with energy.* Mood does work the energy tier doesn't — it filters by *what kind of experience* the user wants, which energy alone can't disambiguate (low energy + intense vs low energy + chill are very different picks).

**Evidence.** Picker rebaseline commit `7400456`. The substitution was implicit in the rebaseline; this entry makes it explicit. Telemetry to validate ships under round-1 intervention #3 (`picker_opened`, `tab_clicked`, `game_launched_externally` — `c9ae919`).

---

## 2026-04-27 — Picker rebaseline + "Let's go" closes the loop

**Decision.** First wave of post-psychology-redteam interventions ships in one pass, all targeting the picker flow. Five user-visible changes:

1. **Pre-roll header drops the subhead.** Was: `🎲 What Should I Play?` + *"Tell us your session, pick a vibe, roll"*. Now: `🎲 What Should I Play?` only. The picker should explain itself; the subhead taxed cognitive load before the user had decided anything.
2. **Energy collapsed to a drawer in the pre-roll.** Default visible state is now header + 2 CTA buttons + 3 collapsed drawers (Energy / More ways / Vibes). Honors the locked 2-input rule at the default state. Energy still selectable, just not in the way.
3. **Post-pick screen strips controls.** The mode/mood/energy pill rows that floated above the picked game are gone from default view, hidden behind a `⚙ Change roll settings` affordance. The pick is now the star of the screen, not the picker.
4. **Stat row drops Metacritic. Why-This-One collapsed by default + dedupes the "Beatable in" pill** with the time already shown in the stat row. Reasoning per Brady: a Metacritic number nudges users toward other people's opinions instead of trusting our pick. We say "we have reason to believe you'll like this," not "here's how it scored."
5. **`Not now` button retired.** The two answers from the picked screen are now `Roll Again` or `Let's go`. The modal × already serves the exit. "Not now" was a third undecided answer in a place that should be binary.

**Plus the broken-promise fix.** `Let's go` now does three things atomically: sets the game's status to Playing Now, fires `steam://rungameid/<appid>` if the game is on Steam (canonical protocol — handles install-if-needed, supports non-Steam shortcuts), and navigates the user to the Playing Now tab via a new `onCommit` prop wired through `app/page.tsx`. The previous behavior — 3-second auto-dismiss inside the modal, then drop the user on the Backlog tab where the game just left — was the literal definition of breaking the loop the app promises.

**Plus the celebration redesign.** Post-accept overlay rewritten with stronger framing: *"Decision made. The hard part's behind you. Get the controller in your hands. Enjoying is the only next step."* Platform-aware encouragement line for non-Steam games (PSN / Xbox / Switch / Epic / GOG / other). Auto-dismiss removed; explicit `Going to play` button is the exit. The job here is to release the user from the app, not loop them back in.

**Plus the descriptor priority overhaul.** `getGameDescriptor` priority reordered: `curated → mood-based → genre fallback → metacritic-scored → edition-nudge`. Rationale: lines that describe what the game *feels like* land harder than lines that describe how critics rated it. New `MOOD_FLAVORS` pool (5 lines per mood across 10 moods = 50 unique flavors) covers non-curated games that have mood tags. The Metacritic-driven score lines (which produced the "A game with flaws and fans. Give it an hour." flavor Brady flagged as too generic) move to last-resort.

**Plus copy fixes.**
- Empty-state copy now plural-aware. *"No games match those moods. Clear them and roll again."* when filters > 1, *"...that mood. Clear it..."* when filters === 1.
- `Just 5 Min` button renamed `5-min tryout` everywhere (button, header, tooltip, suggest copy). Tooltip now anchors the *why* in research-grounded phrasing: *"Five minutes is enough to feel a game. Not enough to second-guess yourself."*
- AuthButton's `Continue without syncing` exit is now unconditional — was hidden for users with no local games (a fresh-device gotcha that left new users with no graceful exit).
- Steam launch button on `GameCard.tsx` upgraded from `steam://run/` to `steam://rungameid/`.

**Why all in one pass.** These changes together form the audit's #1 intervention: rebaseline the picker against its own locked rules and close the loop the app promises. Splitting them into separate commits would mean shipping a partial fix to a broken loop. Treating it as one coherent rebaseline is the honest move.

**Rejected (alternative paths considered).**
- **Per-platform launch buttons (Xbox Cloud, Epic, Battle.net, Ubisoft) in this same pass.** Deferred. The native-channel research surfaced real opportunities, but each requires an ID-resolver subagent (OpenXBL titleId → Microsoft Store productId for Xbox; community-maintained lookups for Epic / Battle.net / Ubisoft). Steam alone covers the largest cohort; the others are a follow-up sprint with focused scope. EA confirmed dead per their own forum — not pursuing.
- **Removing the score-based descriptor pool entirely.** Rejected. With curated + mood + genre fallbacks now ahead of it, score-based fires only when no other path exists, which is rare. Keeping it as a true last-resort is fine.
- **Killing the post-accept overlay and going straight to Playing Now tab.** Rejected. The celebration beat — *"decision made, hard part behind you"* — does meaningful work. Stripping it would technically reduce time-in-app by another second, but the psychological release matters: the user came in carrying the decision weight, and we want to verbally hand it back. Compressing past the celebration sells the moment short.

**Rotting risks to watch.**
- The `⚙ Change roll settings` affordance assumes the user reads the pick before reaching for controls. If telemetry shows users tap that affordance immediately on every pick, the strip-and-collapse design failed and we put the controls back in the wrong place.
- The new mood-based descriptor pool depends on `moodTags` being populated. Games imported before the mood-tag enrichment pass won't have them; they'll fall through to genre or score. Worth a backfill check if the variety still feels weak post-launch.

**Round 2 audit findings deferred to ROADMAP** (not this session): share composer opt-in restructure, stats-page reframes (value-calc as opportunity language, "go pick" CTA, archetype-reroll instrumentation), pile-vs-clear OG share-hierarchy review.

**Native-channel research findings deferred to ROADMAP**: Xbox Cloud launch buttons, Epic / Battle.net / Ubisoft deep links (with ID-resolver scope), Steam Deck Decky Loader plugin (post-launch).

---

## 2026-04-26 — Mission statement locked: "Enjoy your games again"

**Decision.** Inventory Full's internal mission statement is **"Enjoy your games again."** Not user-facing yet — this is the north star that informs every product, design, copy, and distribution decision going forward. Captured in `.claude/rules/brand-messaging.md` as a new "North Star — Mission Statement" section above the existing brand description.

**Why.**
- The product had a thesis ("less time in app = success") and a tagline (`get playing.` — locked Apr 17). What it lacked was a one-line *why* — the user state we're trying to restore. "Enjoy your games again" names that state precisely.
- The word "again" carries the entire emotional arc. The user used to love these games. They got overwhelmed by their own collection. We're not introducing something new — we're reuniting them with something they already chose.
- It works as a feature-decision filter: every proposed feature can be tested against "does this help them enjoy a game they own, or does it make Inventory Full a new thing they have to manage?" Features that fail this don't ship.
- It works as a distribution filter too: if the *channel* (web app vs. native vs. Steam) introduces enough friction that the user can't actually return to their games, the channel decision matters as much as the feature decisions. This frames the upcoming psychology red-team review.
- The phrase emerged organically during a session-close conversation about the upcoming psychology audit. Captured in the moment because that's when these things get crystallized; if we file it for later we'll forget the precise framing.

**Implementation.**
- `.claude/rules/brand-messaging.md` — new "North Star — Mission Statement" section added above the Brand Description block. Includes the three-word breakdown ("Enjoy" / "Your games" / "Again") and the three-question test for any new feature, copy, or channel.
- The locked tagline (`get playing.`) is unchanged. Mission informs the tagline; doesn't replace it.

**Rejected (alternative phrasings considered).**
- **"Enjoy playing (again)"** — close, but loses the possessive ("your games"). The user's relationship to their own library is the load-bearing element; dropping it weakens the line.
- **"Get back to enjoying something already fun that you like"** — descriptive but unwieldy. A mission statement has to be holdable in working memory.
- **No mission statement at all** — leave the thesis ("less time in app = success") as the only internal compass. Rejected: the thesis tells us what success *looks like*, but doesn't name the user state we're restoring. The two complement each other.

**Drift risk.**
- **Mission creep upward.** If "enjoy your games again" gets promoted to user-facing copy without a deliberate decision, it dilutes the existing tagline (`get playing.`) and confuses the brand. Internal use only until a future Brady-approved promotion moment.
- **Drift in interpretation.** "Enjoy" could be diluted to "engage with" — the word "engage" is the enemy. Engagement metrics push toward time-in-app; enjoyment terminates outside the app at the controller. Future copy reviews should challenge any "engagement" reframing.
- **Channel friction blind spot.** The mission demands meeting users where they are. If we stay web-only when the user lives on iOS / Steam Deck / phone-while-watching-TV, the in-app UX excellence may not matter. The upcoming psychology red-team audit must check this honestly.

---

## 2026-04-26 — Pixel sprite system replaces emoji as the primary brand iconography

**Decision.** Inventory Full's user-facing chrome moves from emoji to a custom pixel-sprite system. Three sprite waves in two days fully cover archetypes, moods, status pipeline, tone badges, skip-feedback reasons, and the cleared-trophy celebration. Emoji stay for low-frequency surfaces (energy pills, time tiers, platform circles, copy-flavored decoration).

**Why.**
- Emoji set is inconsistent across platforms (Apple's renderings differ from Google's, etc.) — brand identity at the icon layer was leaking control.
- Personas as emoji (one emoji per archetype) felt low-effort. The persona is supposed to be a personality moment.
- Pixel sprites match the "indie, gaming-buddy, not taking itself too seriously" voice better than the Apple-illustration anime art (apr24 set) we'd briefly considered. The "jank" reads as deliberate retro-game charm, not unfinished — and matches the brand stance better than studio-quality illustration would.
- Existing `PixelSprite` renderer + palette + sprite-string format was already scaffolded in the codebase; only the data was missing.

**Implementation.**
- Wave 1 (yesterday): 42 personas + 13 moods + 1 cleared trophy. Personas wired into `ArchetypeCard`. Mood pills swapped emoji for sprites. Cleared trophy on `CompletionCelebration` confirm screen.
- Wave 2 (today): 5 status sprites (Backlog / Up Next / Playing Now / Completed / Moved On) + 3 tone badges (Roast / Respect / Reading) + 6 skip-feedback reasons. Wired into `TabNav`, `ArchetypeCard` tone badges, `Reroll` skip pills.
- Pre-rendered SVGs land in `public/sprites/` for OG / share / external surfaces. Runtime renderer (`PixelSprite.tsx`) builds from sprite strings in `lib/pixel/data/`.
- Wave 2.1 feedback parked: bright greens on `statusUpNext` and `statusCompleted` — sent to designer.

**Rejected.**
- **Apr24 anime illustrations.** Studio-Ghibli-tier art set expectations of a bigger, more expensive app than this is. Coverage was 23/36 — incomplete. Inconsistent style across the set. Brand mismatch.
- **Wholesale theme-only deployment** (pixel sprites as opt-in theme). Defaults stay emoji, sprites only on a "pixel mode" theme. Cuts blast radius but doesn't capture the brand lift; emoji is the bigger problem.
- **Hybrid (sprite only personas, leave moods + status as emoji).** Would still leave the chrome looking emoji-heavy. Brady opted for the full sweep.

**Drift risk.** Brand consistency now depends on the palette in `lib/pixel/palette.ts` and the sprite strings staying in sync with the design bundle in `notes/`. If Claude Design ships v3 with new colors, the palette needs to grow — there's no automated check. Wave-2.1 brightness fix will exercise the update path.

---

## 2026-04-26 — Stats share card cut from a stat dashboard to an archetype reveal

**Decision.** The stats share card (`app/pile/[id]/opengraph-image.tsx`) no longer renders a flex-wrap row of toggled stat highlights. The card is now a personality archetype reveal: pixel persona sprite (360×360) as the visual hero, archetype name + descriptor + flavor text as the message, inline brand wordmark + "get playing." tagline as the bottom signature. The composer's stat-toggle UI still works and still writes the data; the OG just stops rendering it.

**Why.**
- The chip row was unreadable in feed thumbnails. Label text at 13px renders as ~6px in a Twitter-card preview — the customization the user did was invisible to the audience.
- The persona pixel sprite (shipped in wave 1) was the strongest brand asset we had and wasn't on the share surface. Using it makes the card emotionally legible at a glance.
- Density grew linearly with toggles — the more the user customized, the worse it looked. Inverse of what we want.
- "Either fix it or cut sharing" was the framing. Option C (use sprite, drop stats) preserves virality without doubling down on a layout that wasn't working.

**Implementation.**
- `app/pile/[id]/opengraph-image.tsx` — full rewrite, runtime switched edge → nodejs (needed `fs.readFile` for the persona SVG).
- `lib/archetypes.ts` — `SPRITE_KEY_BY_TITLE` exported for the OG renderer's lookup.
- Wordmark inlined as raw SVG paths (same pattern as the clear card), pink "get playing." rendered separately as text below.
- `StatsCard` interface kept intact for type safety with the composer + API route — only the render layer dropped the unused fields.

**Rejected.**
- **Option A: redesign with bigger numbers + 2×2 stat grid.** Real work, no proof yet that stat-sharing drives anything. Solo builder, 2 weeks to launch — wrong time to iterate on share-card variants.
- **Option B: drop stats sharing entirely.** Throws away virality lever for the personality reveal alongside the dashboard. The personality reveal is the part worth keeping.
- **Keep both with mode toggle.** Two designs to maintain, two layouts to debug, no signal yet to justify the surface area.

**Drift risk.** The composer (`StatsShareComposer.tsx`) still UI-toggles which stats to include, but the OG ignores them. If a future engineer sees the toggles and assumes they render somewhere, that's a confusion vector. Acceptable trade for now since it preserves the option to bring stats back later (Option A) without re-plumbing the API.

**Italic font note.** next/og's satori needs an explicit italic font face for `fontStyle: 'italic'` to render. Outfit doesn't ship italic on gstatic, so the regular Outfit ttf is currently registered as the italic style — flavor text reads upright. Drop in a serif italic (PT Serif, etc.) when polish budget allows.

---

## 2026-04-25 — Landing trimmed to hero-only; /about becomes the canonical product narrative

**Decision.** The landing page (`/`) is now a fast decision funnel: hero + CTAs + footer, nothing else. The marketing narrative (How it works / Not another tracker / pull quote / "3 ways to pick") was deleted from `components/LandingPage.tsx` and lives only on `app/about/page.tsx`, which is now the canonical "what is this product" page.

**Why.**
- The onboarding audit (in this session's resume doc) found that decision-paralyzed users on the landing page were reading ~20s of marketing copy before reaching a CTA. The thesis is "less time in app = success." Marketing copy on landing is time-in-app that doesn't terminate in play.
- About already had near-identical sections (the agent compared them line-for-line). Cutting from landing didn't lose any content — it lost a duplicate.
- Reduces decision surface at the moment when the user is least equipped to handle it.

**Implementation.**
- `components/LandingPage.tsx` — deleted ~165 lines: HOW IT WORKS, THE PITCH, PULL QUOTE, "3 ways to pick" sections, plus orphan `StepCard`, `PickModeCard`, `ImportStepIcon`, `VibeStepIcon`, `PlayStepIcon` components. Replaced with a comment block flagging the move date.
- `app/about/page.tsx` — already had equivalent sections. Only fix: "5 ways to pick" → "4 ways" copy drift (matches 4 cards rendered).
- About nav also got the Wordmark fix — `variant="alone"` → `variant="full"` with `--wordmark-in: #ffffff` inline so it stays legible on the dark nav (matches landing's pattern).

**Rejected.**
- "Keep both pages with marketing narrative; just trim landing slightly." Half-measure. The whole point is a hard split: landing is action funnel, about is narrative.
- "Move sections to a new page like `/why`." More routes, more decisions about which to link to. About is already the right home.
- "Leave landing as-is and just add a `<a href='/about'>Why?</a>` link." Doesn't solve the time-in-app problem on landing.

**Restorability.** All deleted content is in git history at commit `ce5fc7d`'s parent. If we change direction, `git revert` or cherry-pick the deleted block back. Not a one-way door.

---

## 2026-04-25 — Void theme tokens bumped to clear WCAG AA on #000

**Decision.** The Void theme is intentionally the most subdued theme — pure black background with near-monochrome grays — but several tokens (text-dim 1.95:1, accent-pink 1.32:1) failed WCAG AA, making body text invisible and accent UI unreadable. Bumped each token to the minimum value that passes 4.5:1 (text) / 3:1 (UI).

**Why.**
- `AGENTS.md` "Accessibility & Contrast": *"Legibility is non-negotiable. All text/background combinations must meet WCAG AA contrast minimums (4.5:1 for body text, 3:1 for large text). Never defer contrast failures as a 'designer's call' — fix them."*
- The "void = oppressive nothing" design intent doesn't override the legibility rule. Theme can still feel subdued — it's the *most* subdued theme by design — without being unreadable.

**Implementation.** `app/globals.css:1646–1658` — token table updated with comments showing the old → new contrast ratios.

**Rejected.**
- "Leave Void as-is; it's a deliberate aesthetic." Violates the AGENTS.md non-negotiable. AA is a launch gate.
- "Hide Void from the theme picker until it's redesigned." Punts the work; users who already chose Void in localStorage still have it active.

---

## 2026-04-21 — "Pile" vs "backlog" — voice on-page, SEO in meta

**Decision.** The landing subhead is canonical "Your pile's not gonna play itself." — and by extension any on-page h1/h2 that names the whole collection uses "pile." "Backlog" stays reserved for (a) the unplayed-status column in the app and (b) meta description / JSON-LD / keywords for SEO discovery. `voice-charter.md` and `brand-messaging.md` updated today to match.

**Why.**
- Terminology spec (`voice-and-tone.md`) has always said "Backlog" = status, "Pile / Your Library" = whole collection. The charter's subhead line ("Your backlog's not gonna play itself.") contradicted that, and the contradiction surfaced when the shipped h1 got swapped to a wordmark earlier today and Brady asked for the bold line back.
- "Pile" carries voice — warmer, in-group, Brady's. "Backlog" reads generic and tracker-coded, which we are explicitly not.
- "Gaming backlog" is a real search term (11 backlog-weighted keywords in `app/layout.tsx`). Dropping it from the SEO layer would cost inbound traffic.
- Split resolves both: on-page voice wins the in-product moment; meta/SEO voice wins discovery.

**Implementation.**
- `.claude/rules/voice-charter.md:72` — subhead updated with the split rationale.
- `.claude/rules/brand-messaging.md:42` — same.
- `components/LandingPage.tsx` — h1 restored as "Your pile's not gonna play itself." (also removed duplicate hero wordmark, added "Open app" nav button, swapped bottom CTA text for pink tagline wordmark, fixed "5 ways" → "3 ways" copy drift).
- `app/layout.tsx:27-50,112-127` — meta description + keywords still carry "backlog" (verified unchanged).

**Rejected.**
- Using one word for both surfaces. "Backlog" everywhere kills voice on landing; "pile" everywhere leaves discovery on the table.
- Keeping the charter's "backlog" subhead. It contradicted the terminology spec in the same rule set and didn't match shipped copy from before the wordmark experiment.

---

## 2026-04-21 — Launch plan consolidated into single Launch Bible; 7 source docs archived

**Decision.** All launch-planning content now lives in one doc: `docs/LAUNCH_BIBLE.md`. Seven source docs were moved to `docs/archive/launch-2026-04-21/` and marked as frozen history. The bible is the single source of truth; source docs are for reference only.

**Why.**
- Eight scattered docs had accumulated overlap, contradiction, and drift (Friday-Apr-24 soft-launch vs. Apr-28 staggered push; shelf-view vs. tab-pipeline; "we help pick" vs. "we pick"; 5 reroll modes vs. 3). Every session wasted context reconciling them.
- Solo builder needs a daily operational doc, not 8 strategy docs. The bible has a dated day-by-day playbook (Apr 21 → May 18), not just a strategy narrative.
- BradyOS handoff needs a single source to surface today's tasks. Eight docs makes that impossible.

**Four calls locked today (Brady-approved via AskUserQuestion):**

1. **Launch timing: quiet-live now, public push starts Apr 28.** No Fri Apr 24 announcement. The site is already live; we use the interval for Bluesky warmup + Reddit karma farming + PH asset prep. Reddit posts staggered Apr 29 / 30 / May 1 / 3; Product Hunt May 6.

   - Rejected: shipping donationware Fri Apr 24 with full announcement — kills the Reddit warmup window, and the karma protocol needs 7–10 days to defeat sockpuppet detection.
   - Rejected: silent launch with no ceremony — the week of prep has real value (Bluesky follower count grows the PH launch-day reach).

2. **Location: `docs/LAUNCH_BIBLE.md` + sources archived in dated folder.**

   - Rejected: "leave sources in place as deep-dive reference" — sources will go stale and contradict the bible again. Archive + freeze is the only way to prevent drift.
   - Rejected: "replace marketing-prep.md in place" — loses the broader scope (marketing-prep was one of 8; bible is bigger).

3. **Monetization: donationware from day one; Supporter tier at 2k MAU; affiliates gated on RAWG commercial.** Launch with Ko-fi link only. Supporter tier ($3–5/mo cosmetic perks — themes, extra archetypes, early access) ships when rolling-30-day MAU crosses 2k. Affiliate revenue is blocked on RAWG Business plan ($149/mo) because free tier is non-commercial ToS.

   - Rejected: "donationware only in bible scope, separate monetization doc later" — we just consolidated; creating a new parallel doc would reintroduce the drift problem.
   - Rejected: "pre-announce Supporter tier in launch marketing" — commits us publicly before the tier is built.

4. **Pre-launch QA: dated punch list in the bible, integrated with the day-by-day playbook.** Five blocking items (landing wordmark purple, "5 ways" copy drift, reroll mode QA, OG unfurl, sample first-pick tuning) with targets Apr 23–26; five "should fix" items through Apr 27; the rest is post-launch.

   - Rejected: "reference old docs, don't duplicate" — item status would rot across two files and nobody would know which was current.

**Archived docs (frozen in `docs/archive/launch-2026-04-21/`):**
`marketing-prep.md`, `reddit-launch-prep.md`, `email-strategy.md`, `scale-up-plan.md`, `scale-up-costs-2026-04-20.md`, `pre-launch-risks-2026-04-15.md`, `notes/inventory-full-launch-plan_1.md`. README.md in the archive folder maps old → new locations in the bible.

**Not archived:** `BLUE_SKY.md`, `ROADMAP.md`, `ROADMAP_PHASES.md`, `DECISIONS.md`, `competitive-refresh-prompt.md`, `Inventory Full — Ship-Readiness Review/`. These are not launch docs — they're philosophy, product state, decision log, audit templates, external review.

**Implementation.** `docs/LAUNCH_BIBLE.md` (new, ~1000 lines). `docs/archive/launch-2026-04-21/` with 7 files + README. BradyOS handoff written to `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Handoffs/inbox/2026-04-21-launch-bible-and-daily-rhythm.md` so BradyOS can surface today's tasks on demand.

---

## 2026-04-21 — OG images on this repo use Node runtime + fs.readFile + PNG assets

**Decision.** The `/clear/[id]/opengraph-image` route runs on **`runtime = 'nodejs'`**, reads its font TTFs and hero PNG with `fs.readFile` from `public/og-assets/`, and uses **PNG** (not webp) for any `<img>` embedded as a data URL. The root `/opengraph-image` and `/pile/[id]/opengraph-image` routes stay on `edge` for now (they fetch only gstatic fonts, not local assets) but should migrate to the same pattern if they ever need local asset loading.

**Why.**
- **Edge runtime + `new URL(..., import.meta.url)` is broken under Next.js 16 Turbopack production bundling.** Vercel's build passed, but the deployed edge function crashed inside satori's font pipeline (`TypeError: u2 is not iterable`). Two deploys shipped and stayed broken before we caught that the build's green light didn't mean the function ran.
- **Edge + fetching your own origin is fragile.** The original code read `NEXT_PUBLIC_SITE_URL`, which was never set anywhere in the codebase (everything else uses `NEXT_PUBLIC_APP_URL`), fell through to `VERCEL_URL`, and fetched 3 fonts + a 1.7 MB PNG back from `*.vercel.app` — timed out unpredictably under load.
- **`next/og` 16.2.1's satori crashes on webp data URLs.** Same `u2 is not iterable`. Swapping to a 47 KB downsized PNG fixed it. Webp works fine in the app itself — this is a next/og bundled-satori issue.
- Node runtime + `fs.readFile` + `join(process.cwd(), 'public/…')` is the pattern `app/apple-icon.tsx` already uses reliably.

**Implementation.** `app/clear/[id]/opengraph-image.tsx:10` exports `runtime = 'nodejs'`. `loadAssets()` uses `readFile` for TTFs + hero PNG, `fetch` only for the gstatic Outfit Bold URL. Hero embedded as `data:image/png;base64,<Buffer.toString('base64')>`. Assets live in `public/og-assets/Bungee.ttf`, `BungeeInline.ttf`, `hero.png` (540×360, generated from the 1.7 MB original via `sharp`).

**Rejected.**
- Edge + `new URL(..., import.meta.url)` — the canonical @vercel/og docs pattern. Works on webpack, broken on Turbopack prod.
- Edge + fetching from `NEXT_PUBLIC_APP_URL` hardcoded — fixes the env-var bug but keeps the fragile self-origin roundtrip.
- Keeping webp for the hero — 14× smaller than PNG but crashes satori.

**Drift risk.** If future work adds another OG route and reaches for `edge`, it'll hit the same wall. When the root and pile routes need local assets, migrate them to Node too. Also: if `next/og` is ever bumped and satori's webp decoder is fixed upstream, the PNG constraint can relax — test before assuming.

---

## 2026-04-21 — Share composer locked to $ reclaimed + HLTB-faster-than-average

**Decision.** The CompletionCelebration share composer exposes at most two toggles: **$X reclaimed from the pile** (when a price is cached for this game) and **Xh faster than average** (only when the player actually beat the HLTB main-story time). No other stats are shareable.

**Retired from the composer:** hours invested, time in pile, "Game #N, K left in pile", star rating, HLTB-thorough/slower.

**Why.**
- The share card is a brag surface, not a dashboard. Hours invested is ambiguous (80h could be flex or could be a grind). Time-in-pile invites self-judgment. Game-count stats are meaningful to the user in-app but don't carry emotional weight to someone seeing the unfurl cold. Thorough/slower reads apologetic — off-brand.
- The two signals left standing are each unambiguous: recovered dollars is a real-world receipt, HLTB-faster is a skill flex. Both land without context.
- Aligns with the product axiom: fewer decisions at share-time = less time in app.

**Implementation.** `components/CompletionCelebration.tsx` state reduced to `showDollar` + `showHltb`. `hltbFasterHours` memo returns `null` when slower, which gates the toggle's `available` flag — the slower case literally cannot be surfaced. `/api/share` already accepted `dollarValue`/`showDollarValue` so no schema change was needed.

**Rejected.** Keeping a superset of toggles with sensible defaults — would have preserved flexibility at the cost of analysis paralysis at exactly the moment we want the user to close the tab and go brag somewhere.

---

## 2026-04-21 — OG clear card wordmark uses inline SVG paths, not the component or a font approximation

**Decision.** The bottom-right brand mark on the clear-share OG card (`app/clear/[id]/opengraph-image.tsx`) is inlined as raw SVG `<path>` elements copied from `public/if-logos/wordmark-alone.svg`. It does NOT use `components/Wordmark.tsx` and does NOT approximate the mark with Bungee Regular text.

**Why.**
- `@vercel/og` runs on satori. External SVG via `<img src="…wordmark-full.svg">` loads unreliably at edge runtime — we got unsupported-format errors and stale caches.
- `components/Wordmark.tsx` is a client React component with props and className forwarding; satori walks a flat HTML-ish tree, not React. So the component can't be reused directly — only its path data can.
- A Bungee-text approximation was tried and explicitly rejected — wrong letterforms, read as generic retro type rather than the brand mark.

**Implementation.** Two `<path>` elements (teal VENTORY FULL + white IN) inside an inline `<svg>` with the 'alone' viewBox `70 645 2580 335`, pinned bottom-right at 260×34.

**Drift risk.** If the brand wordmark changes, update both `components/Wordmark.tsx` AND the inline paths in `opengraph-image.tsx`. Consider a shared constants file next time this comes up.

---

## 2026-04-20 — RAWG commercial tier is a monetization BLOCKER

**Decision.** Before any revenue feature ships (Supporter tier, affiliate links, paid themes, anything that moves us from "donation-optional" to "commercial"), we MUST first upgrade RAWG from free to a commercial plan.

**Why.** RAWG's free tier terms are explicitly non-commercial. The moment we accept a dollar of revenue tied to the product, continued use of the RAWG free tier violates their ToS — independent of our MAU. Revenue + free RAWG = we're out of compliance from day one.

**The cost.** RAWG Business plan is ~$149/mo. That's the hurdle any monetization surface must clear before it even reduces hosting burden. It's a hefty floor, not a gentle ramp.

**Practical sequencing.**
1. Sign up for RAWG Business (confirm pricing current at time of decision — cited at $149/mo in `docs/scale-up-costs-2026-04-20.md`)
2. Verify API key works and no ToS ambiguity remains
3. Then and only then: ship first revenue feature (affiliate link, Supporter tier, whatever)

**Flagged as a blocker in:**
- `docs/scale-up-costs-2026-04-20.md`
- `docs/monetization-spec-2026-04-20.md`
- This decision log

**Alternatives considered + rejected.**
- Switch to IGDB (free, but requires Twitch OAuth + less complete metadata) — possible long-term but a full migration, not a quick swap. Park as a fallback if RAWG pricing changes unfavorably.
- Cache-only after initial fill (never refresh) — fragile, misses new releases
- Self-host game metadata — not solo-builder-realistic

**How to apply.** Any PR, roadmap item, or session that proposes shipping a monetization surface MUST have "RAWG commercial plan signed up" on the pre-flight checklist. Future sessions: if the user says "let's ship premium / ship the affiliate link / turn on Supporter" — pause and verify RAWG posture before touching code.

---

## 2026-04-20 — Doc audit: overrides + new direction

**Decision.** Ran a full audit of `/docs` after the Apr 14–18 sprint closed. Several prior decisions are explicitly overridden or reinforced. Captured here so future sessions have the authoritative view.

**Overrides:**
- **Apr 3 feature-creep audit on archetypes is REVERSED.** The audit said "cut to 1 archetype, remove reroll." Wrong framing — archetypes are intentional personality, and the reroll lets users cycle through the multiple archetypes that match them. Share card is parked pending per-archetype art (Brady working on it), not abandoned.
- **Apr 3 feature-creep audit on themes (9 → 5) is REVERSED.** No maintenance-burden signal has surfaced. Theme count is now 13 and fine. Themes are part of the moat per the Apr 20 design review.
- **Three pick modes (Just 5 Mins / Quick Session / Almost Done) confirmed distinct, NOT redundant.** Earlier audit sketched them as overlapping HLTB filters; wrong. *Just 5 Mins* is psychological foot-in-the-door — "try for 5 minutes, decide after," not HLTB-based, we decide for them. *Quick Session* is HLTB-filtered short games for a 20-min window. *Almost Done* is HLTB time-remaining sort for backlog clearers. Different psychology, different data, all earning their slot. Don't flag again.

**Reinforced / upgraded:**
- **Email re-engagement moves up** — out from behind push notifications (Phase 5) to Tier 1 of the email strategy. Push still Phase 5. Email is cheaper, faster, and addresses the retention blind spot without service-worker complexity. See `docs/email-infra-spec-2026-04-20.md`.
- **ROADMAP sprint labeling** — "CURRENT SPRINT" was active language; closed Apr 18. Relabeled as "LAST SPRINT — CLOSED" with "NEXT SPRINT — TBD" left deliberately blank until Brady picks.
- **`decision-engine-v3-spec.md`** marked shipped/historical at the top. All six V3 features are live.

**New specs written this cycle (all in `docs/`):**
- `doc-audit-2026-04-20.md` — the audit itself
- `competitive-landscape-2026-04-20.md` + `competitive-refresh-prompt.md`
- `monetization-spec-2026-04-20.md` — cover-costs-first, two tiers, $3/mo Supporter with theme gating
- `scale-up-costs-2026-04-20.md` + `email-infra-spec-2026-04-20.md`
- `seo-audit-2026-04-20.md` — quick-win list, implementation in progress
- `metrics-radar-2026-04-20.md` — MAU-triggered instrumentation plan
- `pwa-explainer-2026-04-20.md` — three tiers, Tier 1 shipped, others deferred
- `ai-lingo-reference.md` + `archetypes-catalogue.md`
- `IDEAS.md` gained the Taste Reflection feature

**Biggest strategic call from the audit:** retention is our biggest unflagged blind spot. We have zero cohort data. Instrumentation plan gated to MAU thresholds so we don't over-build pre-launch, but `metrics-radar-2026-04-20.md` specifies exactly what to flip on at 500 / 2k / 5k / 15k MAU.

---

## 2026-04-17 — Modal restructure: 2 CTAs + 2 dropdowns; Deep Cut / Almost Done retired

**Decision.** The Reroll modal pre-roll picker goes from 5 mode cards + 10-chip mood grid + Roll button to: top row of 2 CTAs (🎲 Anything + ⚡ Just 5 mins), collapsible "More ways to play" (Quick Session + Resume), collapsible "Vibes" (mood chips). Each mode button rolls immediately — no separate Roll button anymore. Internal `continue` key stays (persisted state + analytics keep working); user label becomes "Resume" with ➡️.

**Deep Cut and Almost Done retire.** Both were absorbed into Resume's Smart Pick priority chain two commits ago (Forgotten Gem / Unfinished Business cover old Deep Cut; Almost There covers old Almost Done). Keeping them as separate modes was redundant and diluted the picker.

**"Just 5 mins" lives inside the modal, not the library strip.** The standalone green button is hidden on the main page via `hideButton` prop. `JustFiveMinutes` became a `forwardRef` exposing `startSession`; page.tsx holds the ref and passes a callback to `<Reroll>`. The Reroll CTA closes the reroll modal and calls `ref.startSession()`. Rejected: lifting the JustFiveMinutes modal to page.tsx — bigger refactor, no additional benefit over the ref pattern.

**Sub Shuffle stays visible.** Spec said "reroll mode buttons retire"; Sub Shuffle is a GP/PS+ catalog picker, not a reroll mode. Killing it would be a UX regression with no new home defined. Kept it in a one-item strip under the hero.

**Hero button opens picker, not auto-roll.** Previously `onClick={handleOpenReroll('anything')}` bypassed the picker and rolled immediately. With 2 top CTAs now, opening to the picker is fast enough that auto-rolling robs the user of the Just 5 mins option. PostImportSummary's explicit "Play" button keeps auto-roll since the user's intent is clear there.

**Cognitive load framing (§3 user-psychology).** The new modal has 2 visible choices (Anything + Just 5 mins), energy pills, and two one-tap dropdowns — down from an always-visible wall of 5 mode cards + 10 mood chips. Picker opens lighter, still reaches the same destinations in one extra tap. Trade: users who wanted Quick Session or Resume now take one more click. Worth it — for the overloaded-library user the fewer visible choices at decision time matter more than shaving a click off two specific paths.

---

## 2026-04-17 — Tab-follow via CustomEvent + Smart Pick trigger pill

**Decision.** Status-change tab-follow (auto-switch + flash + row pulse) is driven by a window-level `gp-status-change` CustomEvent dispatched from `GameCard.handleStatusClick`. `app/page.tsx` listens and triggers `triggerTabFollow(targetTab, gameId)` — sets `activeTab` + `flashingTab` (1s) + `recentlyMovedId` (1.5s), cleared by timers.

**Why the event, not just the prop.** `GameCard` is rendered in three contexts: the list view (prop threaded from page.tsx ✓), the grid view (no direct GameCard, but `GridCard` opens `GameDetailModal` → which renders `GameCard forceExpanded` with no `onStatusChange` prop ✗), and inside `GameDetailModal` itself. Threading the prop through every mount point would force `GridCard` and `GameDetailModal` to know about page-level tab state they otherwise don't care about. A single broadcast keeps the coupling one-directional: GameCard only knows it moved a game; page.tsx decides what to do with that signal. Rejected alternatives: (1) lift `GameDetailModal` to page.tsx — big refactor for one feature; (2) Zustand action — adds transient UI state to a data store.

**Row-pulse wrapper, not class merge.** `card-enter` and `row-pulse` both use the `animation` CSS property, so co-applying them on the same element drops one. Wrapped the `<GameCard>` / `<GridCard>` in an inner div that takes `row-pulse` conditionally. Keeps mount-time slide-in intact while layering the pulse.

**Smart Pick trigger pill styling.** The Smart Pick triggering reason now leads "Why this one" with a purple-tinted background + 2px accent-purple left border. Secondary reasons (Metacritic, mood, backlog age) stay unstyled so they read as supporting evidence. Trigger labels stay short for pill width: `85% to credits` / `Still warm, 3h in` / `3h in, top-rated` / `3h in, then silence`. "Then silence" echoes the approved `smartPickCopy.ts` headline — keeps voice consistent.

---

## 2026-04-17 — Smart Pick engine wired + reroll count bug fixed

**Decision.** `lib/reroll.ts` gains `classifySmartPick(game)` and `pickSmartResume(...)`. Resume mode (internal key still `continue`) runs the priority chain (Almost There → Keep Flowing → Forgotten Gem → Unfinished Business), picking from the highest-priority non-empty bucket via `pickWeighted`. `continue` eligibility broadened to include `buried` status so Forgotten Gem / Unfinished Business candidates can surface.

**Forgotten Gem falls back to Metacritic ≥85.** Steam positive % + review count aren't on the `Game` type yet (flagged in the session-resume gotchas). When that enrichment lands we can widen the gate. This is a deliberate partial implementation — shipping the engine now unblocks the pill UI and the modal restructure without waiting on enrichment.

**Roll-count bug: fixed by split-counter pattern.** Previously `doRoll` called the store's `incrementReroll` on every invocation, so mode-switch pills (which auto-roll in the new mode) burned toward the 10-per-session cap. Fix: `doRoll` now takes `countAsRoll` (default `true`); mode and energy pills pass `false`; store `incrementReroll` moves to the commit path (`handleLetsGo`) only. The forced-choice gate at roll 10 and the "Roll N" label now read from a local `rollCount` state. Rejected: deleting the 10-roll cap entirely. We want forced-choice to fire when a user legitimately burns 10 *intentional* rerolls, just not from browsing modes.

**Deep Cut mode still in the UI.** Spec said it could be retired (folded into Resume's Unfinished Business / Forgotten Gem buckets). Held until the modal restructure — touching the mode list without updating the landing mode cards causes drift.

---

## 2026-04-17 — Smart Pick copy locked + "tonight" retired from session copy

**Decision.** Four Smart Pick types ship with 6-line headline pools each, stored in `lib/smartPickCopy.ts`. Selection is hash-based on game name — same game always returns the same headline, different games rotate. The types:

1. **Almost There** 🏁 — game is near the HLTB finish line (≥75% through).
2. **Keep Flowing** 🌊 — game is currently in Playing Now with real hours.
3. **Forgotten Gem** 💎 — shelved with 5h+ invested AND high-rated (Steam ≥85% positive with 500+ reviews, or Metacritic ≥85).
4. **Unfinished Business** — shelved with 5h+ invested, fallback when Forgotten Gem doesn't qualify.

Priority chain (first match wins): Almost There → Keep Flowing → Forgotten Gem → Unfinished Business.

Smart Pick fires inside the Resume mode (renamed from the internal `continue` / user-facing `Keep Playing` that collided with the Playing Now status label). Result-card treatment: a `🧠 Smart Pick · [type name]` pill at the top, with the headline below. The triggering reason is the #1 highlighted entry in "Why this one," other reasons (Metacritic, mood match) render beneath unstyled.

Also locked in the same pass: **"tonight" is retired anywhere it implied a gaming session.** Replaced with "today" or neutral phrasing. Touches reroll mode description, help modal, stats share lines, landing + about "5 ways to pick" section, marathon tier description.

**Why.**
- The earlier mode set (Anything / Quick Session / Deep Cut / Keep Playing / Almost Done) had two overlapping names ("Keep Playing" vs the "Playing Now" status shelf) and five decisions at pick time, violating the 2-input psychology ceiling from `.claude/rules/user-psychology.md`.
- Consolidating Keep Playing + Deep Cut into a single Resume umbrella with sub-typed headlines gives us the differentiation in voice without the decision cost. The user picks ONE mode; we do the internal routing.
- Hash-based selection (vs random) means the same game gets the same headline on reroll — reduces the "every pick is trying to sell me" feel.
- "Tonight" implies an evening gaming session. Users pick games mid-day, at lunch, on weekends. "Today" is neutral. The earlier sweep caught 11 occurrences across landing, about, help, reroll description, and stats share copy.

**Rejected.**
- **Keep all five modes as separate buttons.** Violates the 2-input rule and creates decision overhead before the actual pick decision.
- **Random rotation of headlines.** Would make each reroll feel different even for the same game; hash-stable selection is warmer.
- **"Deep Cut" as the cold-shelved label.** Collided with `TimeTier.deep-cut`. "Unfinished Business" is motivating without being lore-y; "Forgotten Gem" carves out the high-rated subset so we're not pre-emptively calling every shelved game a gem.

**How to apply this.** When adding a new Smart Pick type, update `lib/smartPickCopy.ts` (add to `SmartPickType` union, `SMART_PICK_LABELS`, and `HEADLINES`) and add a detection branch to the resolver in `lib/reroll.ts` (ships in next commit). Priority order matters — put stricter conditions first.

**Evidence.** Copy file: `lib/smartPickCopy.ts`. Voice filter passed per `.claude/rules/voice-and-tone.md`. Approved by Brady 2026-04-17 with two revisions from initial draft ("Maybe that changes tonight" → "today"; "Hmm" → "Time to jump back in."). Engine wiring + modal layout land in subsequent commits.

---

## 2026-04-17 — Tagline retagged: "get playing." (supersedes "Stop stalling. Get playing.")

**Decision.** The primary tagline is now "get playing." (lowercase, with the period) alone. Everywhere the longer "Stop stalling. Get playing." appeared — page titles, OG metadata, landing bottom CTA, about page, email templates, pile + clear share pages, root OG card — is updated to the short form. Case is intentional: lowercase reads friendlier and matches the app's casual voice. The landing page h1 remains "Inventory Full"; "get playing." sits under it as a supporting line, not as a replacement h1. Supersedes the Apr 8 lock.

**Why.**
- **Redundant pain-naming.** The product name "Inventory Full" already names the backlog-overload pain. "Stop stalling" restated it and landed as scolding on a second pass.
- **Reactance.** Per `.claude/rules/user-psychology.md` §4, correction imperatives ("stop doing X") trigger more pushback than forward imperatives ("do Y") in commitment-avoidant users. "Get playing" is the forward form.
- **AI-tell cadence.** The symmetrical "two-words. two-words." structure is flagged in `.claude/rules/voice-and-tone.md` under banned structural patterns. Brady's gut kept catching it for that reason.
- **Meta-alignment.** The product's thesis is "remove barriers to playing." A tagline that removes two words to say the same thing is the product acting like itself.

**Rejected.**
- **Keep "Stop stalling. Get playing." everywhere.** The settled choice for 9 days, but the reasons above compounded.
- **Keep both, split by surface** (short form in-app, long form on landing). Rejected — two taglines is the problem the Apr 8 lock solved. Splitting by surface re-creates the drift.
- **Alternative rewrites** ("Less pile, more play", "Your pile, unlocked", etc.). None beat "get playing." for brevity, clarity, or confidence. Stopped iterating when the short form tested best against the voice/psychology rules.
- **Sentence case "Get playing."** Considered and held for the first push on Apr 17, then lowercased later the same day. Lowercase reads friendlier, matches the conversational voice, and visually signals "less formal" without trying hard. Consistency point: the lowercase is the ONLY correct form.

**How to apply this.** Any surface that needs a tagline uses "get playing." (lowercase, with the period). If a longer brand line is needed (rare), pull a supporting line from `.claude/rules/brand-messaging.md` ("Your backlog's not gonna play itself." / "Less shame. More game.") — those are subheads, not alternative taglines.

**Evidence.** Sweep across `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/opengraph-image.tsx`, `app/clear/[id]/{page,opengraph-image}.tsx`, `app/pile/[id]/{page,opengraph-image}.tsx`, `components/LandingPage.tsx`, `docs/email-templates/magic-link.html`, plus rule docs `.claude/rules/brand-messaging.md` and `.claude/rules/user-psychology.md`, and roadmap/ideas docs. Commit landing 2026-04-17.

---

## 2026-04-13 — OG stats card: two-column layout, logo as hero, archetype-forward

**Decision.** The stats OG card (`app/pile/[id]/opengraph-image.tsx`) uses a two-column layout: 280px logomark + brand name + tagline stacked on the left (takes roughly half the card), archetype name/descriptor/flavor text/value pills stacked on the right. Peripheral chrome (games tracked, exploration %, compact stats line, CTA, URL) sits small at the edges. All user-selected content (archetype, flavor text, checked values) renders large and legibly.

**Why.** First pass had an 80px logo and dense 4-stat grid that nobody could read at share-card scale. Brady's feedback over 5 iterations drove the final sizing: the logo needed to be a hero element (320px → 280px after content sizing), the tagline "Stop stalling. Get playing." had to be legible (24px), and the user's selected content (archetype 48px, descriptor 26px, flavor 24px) should dominate over the peripheral stats (which people won't read at share size anyway).

**Rejected.**
- **Stats grid with 4 pill cards in a row.** Too small to read, wasted space on labels nobody scans in a thumbnail.
- **Logo in top-left corner at 80px.** Invisible. The logo has to function as the brand signal when someone glances at a Twitter/Discord unfurl.
- **Fit-everything-in-top-header layout.** Crammed the brand, exploration bar, and games count into a single header row — the brand got lost.

**Evidence.** Commits `9b90dd7`, `5abadf4`, `517ea90`, `e305ac6`. Iteration was rapid (5 pushes in one session) because OG images can't be tested in browser preview — each size change required a commit + deploy + unfurl check.

---

## 2026-04-12 — Stats share cards mirror clear card architecture at /pile/[id]

**Decision.** Stats share cards use the same architecture as completion share cards: Supabase table (`share_stats`), service-role API writes, 8-char nanoid URLs, server-rendered Satori OG images, public landing page. The route is `/pile/[id]` not `/stats/[id]`.

**Why.** The architecture is proven (clear cards have been live since Apr 8 with no issues). Reusing the same patterns means no new infrastructure, the same RLS model, and the same mental model for maintainability. `/pile/[id]` was chosen over `/stats/[id]` because "pile" is the brand term for a user's library and the card shows their pile's state, not abstract statistics.

**Rejected.**
- **Client-side only (screenshot approach).** Would not generate OG images for unfurls. The whole point is that pasting the link into Discord/Twitter/Slack shows a rich preview.
- **Encode stats in URL params.** Same rejection as clear cards: ugly URLs, leaky, breaks on Twitter's shortener.
- **`/stats/[id]`** — "stats" is generic. "pile" is the brand word.

**Evidence.** `supabase/migrations/004_share_stats.sql`, `app/api/share-stats/route.ts`, `app/pile/[id]/page.tsx`, `app/pile/[id]/opengraph-image.tsx`, `components/StatsShareComposer.tsx`.

---

## 2026-04-12 — Sample data onboarding: pulse CTA instead of auto-reroll

**Decision.** When users load sample data, the import summary modal is skipped entirely. Instead of auto-opening the reroll picker after 800ms (the Apr 8 behavior), the "What Should I Play?" button gets a pulse animation to draw attention without forcing the user into an interaction.

**Why.** Two separate problems. First: sample users don't care how many games were imported or what platforms they came from, so the import summary modal was noise. Second: the 800ms auto-reroll was too aggressive for sample users who haven't oriented themselves yet. They haven't built any ownership of the library, so launching the picker felt disorienting. The pulse splits the difference: it says "this is the main thing" without taking control away.

**Rejected.**
- **Keep import summary for sample users.** Zero value. They didn't import anything real.
- **Keep 800ms auto-reroll.** Too aggressive for users who haven't even looked at the app yet.
- **No highlighting at all.** Users wouldn't know what to do next. The button needs to stand out.

**Evidence.** `app/page.tsx` (isSampleLoad ref, pulseReroll state). Commit `2e20801`.

---

## 2026-04-12 — Celebration modal gets overflow-y-auto and close X button

**Decision.** The completion celebration modal changed from `overflow-hidden` to `overflow-y-auto` with `max-h-[85dvh]`, and a close X button was added at top right.

**Why.** On mobile, the modal content (rating stars, flavor text, share composer, action buttons) exceeded the viewport height. With `overflow-hidden`, the bottom buttons were clipped with no way to reach them or dismiss the modal. The X button is defense-in-depth: even if scrolling somehow fails, users have a clear escape. `85dvh` leaves room for the system UI chrome on mobile browsers.

**Rejected.**
- **Reduce content to fit.** The share composer is the main new feature and can't be cut.
- **Full-screen modal on mobile.** Loses the "card floating over the page" feel that makes the celebration feel like a moment.

**Evidence.** `components/CompletionCelebration.tsx`. Commit `7999878`.

---

## 2026-04-09 — Security posture: user-level deny-list only, no tooling overhead

**Decision.** Created `~/.claude/settings.json` with a narrow Read-deny list for credential files (`~/.ssh/**`, `~/.aws/**`, `~/.gnupg/**`, `~/.azure/**`, `~/.kube/**`, `~/.npmrc`, `~/.git-credentials`, `~/.config/gh/**`, `~/.netrc`, `~/.pypirc`, `.env` / `.env.*` at any depth). Nothing else.

**Why.** Reviewed an engagement-farming security tweet (dropped in `notes/Firefox.pdf`) that pushed a much heavier stack: Trail of Bits' `claude-code-plugins`, running everything in devcontainers, bash denies on `curl *.sh | sh`, IBM "197-day breach detection" stat, etc. Most of it was either cargo-culted or actively hostile to how this project actually works.

**Rejected.**
- **Trail of Bits plugin.** Overkill for a solo pre-revenue app. Adds a moving dependency for marginal defense. Revisit if/when a team or sensitive data shows up.
- **Devcontainers.** Would break the fnm + native Next.js workflow without fixing a problem Brady actually has.
- **Bash curl/`sh` denies.** Would break legitimate API debugging (psn, xbl.io, HLTB probes we run regularly) for zero real-world attack surface on this box.
- **Project-level denies.** Skipped intentionally — this is personal-machine hardening, not something to commit into the repo. User-level `~/.claude/settings.json` merges with project settings automatically, deny rules stack, most restrictive wins.

**Evidence.** `~/.claude/settings.json` created this session. Engagement-farming tweet archived at `notes/Firefox.pdf`.

---

## 2026-04-09 — Safari FeatureCard icons need explicit width/height attributes

**Decision.** All six FeatureCard SVGs in `components/LandingPage.tsx` (Mood, Clock, Timer, Party, Free, Lock) got explicit `width="20" height="20"` attributes in addition to the existing Tailwind `className="w-5 h-5"`. Step icons were left alone.

**Why.** Safari was collapsing the feature-card icons to 0×0. Brave rendered them fine. Root cause: when an SVG has no intrinsic size attributes and lives inside a `w-10 h-10 flex items-center justify-center` wrapper, Safari's flex layout resolves the child's intrinsic size first, sees `0×0`, and keeps it there — the Tailwind width/height classes on the SVG never get a chance. Explicit `width`/`height` attributes give Safari something to anchor on.

**Rejected.**
- **Just size the wrapper.** The wrapper was already sized. Safari was ignoring the child's className sizing, not the wrapper.
- **Use `<img src="...svg">`.** Loses the theming via `currentColor`.
- **Fix the step icons too.** They render in a different flex context without the collapsing behavior. Not broken, didn't touch them.

**Evidence.** Commit `10db53e`. Step icons vs FeatureCard icons in `components/LandingPage.tsx`.

---

## 2026-04-09 — Sparkle icon variant preserved as intentional second option, not a duplicate

**Decision.** The files that showed up as `public/icon-192 2.png` / `public/icon-512 2.png` were renamed to `icon-192-sparkle.png` / `icon-512-sparkle.png` and committed intentionally. They are not wired to the manifest — the clean set still ships. The sparkle set is available by hand for celebration moments, launch posts, etc.

**Why.** I initially called them iCloud sync duplicates (the " 2" suffix pattern looks exactly like iCloud collision artifacts). Brady pushed back: file sizes differed (27005 vs 18586, 145834 vs 102393). On inspection they were genuinely different renders — one clean, one with purple sparkle/starburst rays behind the controller. Both came from today's icon regen pass; the sparkle version was the 10:28 pass, the clean version was the 11:03 pass that overwrote the canonical filenames, and iCloud preserved the original under " 2".

**Rejected.**
- **Delete as duplicates.** Was my first instinct and it was wrong.
- **Swap the manifest to sparkle.** The clean version is the right default. Sparkle is too loud for a home-screen icon you see every day.

**Lesson for future me.** When files with similar names have different byte counts, that is a signal they are not copies. Check content, not just naming. Also: something regenerated the icons twice today without Brady touching them — next time icons move, investigate the pipeline before assuming iCloud.

**Evidence.** Commit `d0982d1`. `public/icon-*-sparkle.png`.

---

## 2026-04-09 — Sweep rule: user-facing strings get updated, internal identifiers don't

**Decision.** During the "bail" → "Moved On" component sweep, all user-visible strings, toasts, labels, placeholders, and help copy got updated. Internal code — `canBail`, `setBailed`, `showBailed`, the `bailed` status key — stayed as-is.

**Why.** Two different kinds of rename live under one request. User-facing copy is brand surface area and has to be consistent or the product feels drifted. Internal identifiers are a type-level refactor: renaming them means touching every file that imports the type, updating tests, risking import regressions, and getting zero user-visible benefit. The cost/benefit gap is huge. Fix what the user sees; leave the wiring alone until there's a reason to touch it.

**Rejected.**
- **Full rename including identifiers.** Would have touched ~dozen more files, risked breakage, delivered nothing a user notices.
- **Leave the strings and only change the obvious ones.** Would have left drift across toasts, caps, help modal, share card API. The whole point was to re-lock the vocabulary.

**How to apply this next time.** When a naming/voice decision gets made, the default sweep scope is **user-visible strings only**. Internal identifiers are a separate decision with a separate cost. Call it out explicitly so there's no ambiguity.

**Evidence.** Commit `e59d8f3`. `components/GameCard.tsx` still has `canBail`/`setBailed` props; toasts and placeholders all say "Moved On" / "Why'd you move on".

---

## 2026-04-09 — Em-dash rule is absolute in marketing copy

**Decision.** Em-dashes are banned from user-facing marketing copy. Use commas, periods, or line breaks instead. This applies even in conversational, spicy, brand-voice copy where an em-dash would "feel right."

**Why.** The rule was already in `.claude/rules/voice-and-tone.md` but I treated it as context-dependent and wrote "Perfect — we've got you." as a landing subhead option. Brady's correction was direct: "drop the em dash lol". The rule is not "avoid em-dashes in formal writing" — it's "don't write AI-sounding copy," and the em-dash is one of the highest-signal AI tells. There is no marketing context where it gets a pass.

**Rejected.**
- **Em-dash for dramatic pause in short punchy copy.** This is the exact thing the rule targets.
- **Replace with `—` via CSS so it's "technically not a character."** Not even trying that.

**How to apply this next time.** Any landing page, about page, hero, H2, CTA, feature card, or social post draft gets the voice sweep pre-commit. The avoid-AI-SKILL reference in `docs/avoid-AI-SKILL.md` is the canonical checklist. Grep for `—` in changed files before committing marketing copy.

**Evidence.** Commit `10db53e`. Brady's in-session correction.

---

## 2026-04-09 — Landing hero: "Can't decide what to play? Yeah, we know."

**Decision.** Replaced the four-sentence hero body on landing and about pages with a single line: **"Can't decide what to play? Yeah, we know."** H2 swapped from "Three steps. We do the hard part." to "It's really just three things:". Step 3 description rewritten around "We pick, you play. Clear it, drop it, or just move on? No judgement. Moving on is deciding too." The standalone nudge paragraph ("We nudge you to play. If you don't like the game, blame us and keep going.") was removed.

**Why.** The old four-liner ("Import your library. Tell us your mood. We pick the game. You hit play.") had a word-word-word-word rhythm that landed as staccato and AI-adjacent. Brady read it and the rhythm was the specific thing that bothered him. The new subhead leans fully into the empathy: name the problem, acknowledge it, done. It is deliberately not a feature pitch. The feature pitch is in the three steps below.

Brady picked option B over an option A ("Can't decide? Perfect, we got you."). Option A was less specific and the "Perfect" was the kind of reassurance-prefix that reads as AI. Brady's note on B: "bold and spicy and perfect. it lands perfect for who it needs to and doesn't for who it doesn't." The willingness to let the copy land with some people and not others is itself the decision — there's no attempt to be universally friendly.

The H2 swap is the same move at a different scale: "Three steps. We do the hard part." was telling the user what to feel. "It's really just three things:" is teasing the list instead of summarizing it, and the list does the work.

**Rejected.**
- **Keep the four-line block.** The rhythm was the problem. Tweaking words wouldn't fix it.
- **Option A ("Can't decide? Perfect, we got you.")** — Brady's B vote. Too generic, the reassurance-prefix reads as AI.
- **Keep the nudge paragraph.** Surrounding pitch copy already carries the point. The nudge was an extra beat the page didn't need.

**Evidence.** Commit `10db53e`. `components/LandingPage.tsx` and `app/about/page.tsx`.

---

## 2026-04-09 — Status cycle locked, "bail" retired from user copy

**Decision.** The game status cycle is locked to: **Backlog → Up Next → Playing Now → Completed → Moved On**. The word "bail" is retired from all user-facing copy. The button verb for the move-on action is "Not for me"; the destination state is "Moved On". The Playing Now tab icon is ▶️ (was 🔥 — 🔥 stays on the `deep-cut` time tier).

**Superseded (2026-05-13).** "Not for me" button renamed to **"I'm moving on"**. Confirmation prompt updated to "Moving on from this game for good?" with "Yeah, not for me" / "Not yet". The first-person active framing better echoes "Moving on is deciding too" and connects the button action to the status name. The "Don't suggest" / "Hide from picks" manual toggle removed — skip-penalty system (3+ skips = weight penalty, 5+ = soft-ignore) covers the same need algorithmically. Delete from library retained for garbage-collection use case (wrong imports, DLC packs).

**Why.** Semantic audit found drift everywhere: "Now Playing" vs "Playing Now", "Bailed" vs "Moved On" vs "Dropped", tab icons not matching cap copy, help modal referencing filter toggles that don't exist. Lock the vocabulary now, sweep every surface once, and future additions inherit the locked terms.

Brady's reasoning on retiring "bail": *"bail is too 'lingo' it's like gnarly or rad or cowabunga. good character, but pigeonholed and alienating."* The word has a specific generational/subcultural read that narrows the audience without adding warmth. "Moved On" is neutral, compassionate, and carries the brand thesis (declining a game is a decision, not a failure) without leaning on slang.

The "Not for me" / "Moved On" split (action verb vs destination state) is intentional and not contradictory. The button is what you press; the shelf is where it ends up. Button tense and state tense are different jobs.

**Rejected.**
- **Keep "bail"** — it was the working word for months, it's tight, it has character. Rejected for being narrowing.
- **"Dropped"** — reads as failure in gaming contexts (dropped from ranked, etc.). Carries shame.
- **"Abandoned"** — too strong, too judgmental.
- **Renaming the internal `bailed` status key.** See the sweep-rule decision above — internal identifiers stay.
- **🔥 on Playing Now** — icon collided with the `deep-cut` time tier and felt like it was shouting. ▶️ is calmer and matches the literal meaning.

**Evidence.** Commits `ffbc343`, `5c15587`, `e59d8f3`, `10db53e`. `.claude/rules/brand-messaging.md` and `.claude/rules/voice-and-tone.md` document the locked cycle. The `deep-cut` time tier decision is parked — Brady is unsure what "Deep Cut" means as a session-tier name.

---

> **Entries below are backfilled on 2026-04-09 from two sources:** (a) the current-session memory files `apr5.md` → `apr8.md`, and (b) the prior session's memory files in `~/.claude/projects/.../Get-Playing--Project-Brief/memory/` (dated Apr 1-4). The session memory files summarize *what shipped* more than *why it shipped*, so these entries reconstruct the reasoning from context where I'm confident and flag gaps where I'm not. If the "why" on one of these ever matters for a new decision, verify against `git log` or ask Brady — the original in-session reasoning wasn't always captured.

---

## 2026-04-08 — Tagline locked: "Stop stalling. Get playing."

**Decision.** "Stop stalling. Get playing." is THE tagline. It goes on every surface: page titles, OG metadata, headers, footers, share cards. Supporting lines ("Your backlog's not gonna play itself.", "Less shame. More game.") are subheads or celebration-context only, never competing taglines.

**Why.** Before Apr 8 there were 5+ competing taglines drifting across different surfaces. A user landing on the home page saw one message, the share card said another, the OG metadata said a third. Picking one and banning the rest is worth more than any individual phrase being "better."

**Rejected.**
- **"Your backlog's not gonna play itself."** — Good line, now demoted to subhead. It names the pain but doesn't promise the fix.
- **"Less shame. More game."** — Kept, but only in celebration/share contexts. Too flippant as a first-touch line.
- **Rotate taglines by surface.** Would keep drift alive forever.

**How to apply this.** Any new surface that needs a tagline uses "Stop stalling. Get playing." If you want to write something else, you are probably writing a subhead, not a tagline. Subheads are fine but they do not get to claim top billing.

**Evidence.** `.claude/rules/brand-messaging.md` (primary tagline section). Apr 8 session memory.

---

## 2026-04-08 — Onboarding hierarchy: action first, auth second

**Decision.** The GetStartedModal shows import and sample options above the fold; auth ("want to sync?") lives below a divider. When a user picks "try with sample data", the reroll picker auto-opens after 800ms. The post-import summary modal's primary CTA is "What Should I Play?" not "Got it."

**Why.** Every extra step before the core loop is a place new users drop. The core loop is Import → Mood → Play. Auth is a sync convenience, not a requirement for the product to work. Putting auth above the fold implied it was a prerequisite; burying it below a divider makes the real path (import or sample, then play) visually dominant. The 800ms auto-reroll lets sample users experience the core loop without having to hunt for a button — they land on the app, see their library for a blink, then the reroll picker takes over and the app is already *doing the thing it's for*.

**Rejected.**
- **Auth above the fold.** Implied the product needed an account.
- **"Got it" as primary post-import CTA.** Dead-end. Users would close the modal and stare at the library.
- **Wait for the user to click into reroll on sample mode.** Required them to know reroll was the main thing. Most new users don't.

**How to apply this.** New onboarding surfaces inherit the rule: the path to playing a game is above the fold; everything else (auth, settings, explanations) is below. If a new surface buries the core loop, it's wrong.

**Evidence.** Apr 8 session memory "Onboarding tightening" section.

---

## 2026-04-08 — Shelf/Session dropdowns removed from game card

**Decision.** The per-game Shelf and Session dropdowns in the game-card detail view were deleted entirely, not hidden behind a setting.

**Why.** They were a power-user feature that added decision paralysis to a UI that exists to *reduce* decision paralysis. Every dropdown is a decision a user has to make. For 99% of users, the answer is "I don't know, just help me pick a game" — the dropdowns were surfacing organization the user didn't ask to do. The whole product thesis is that organizing your pile is the distraction that keeps you from playing it.

**Rejected.**
- **Hide behind an advanced toggle.** Keeps the complexity in the codebase forever for the 1% who might want it, and those users can still find it. No.
- **Keep but collapse by default.** Still visible, still a decision to make about whether to expand it.

**How to apply this.** Future features that let users *organize* instead of *play* get this same scrutiny. If a feature adds decisions without moving the user closer to launching a game, it's a candidate for deletion, not refinement.

**Evidence.** Apr 8 session memory "Game card detail UX cleanup" section.

---

## 2026-04-08 — Share cards stored server-side in Supabase, not URL-encoded

**Decision.** Share card payloads live in a `share_cards` Supabase table (public read RLS, service-role writes) behind an 8-char nanoid. The `/clear/[id]` landing page fetches the row; the `/clear/[id]/opengraph-image` route renders the dynamic PNG via Satori.

**Why.** URL-encoding the share card payload would produce an ugly, long link that breaks on Twitter's URL shortener, previews badly, and exposes the full payload in any log or analytics pipeline that captures referrers. An 8-char nanoid gives a clean `inventoryfull.gg/clear/abc12345` URL that is easy to share verbally, works inside SMS/tweets without truncation, and keeps the payload out of URL-level logs. The storage cost is trivial (small JSON rows on Supabase free tier).

**Rejected.**
- **URL-encoded payload.** Ugly, long, leaky.
- **Client-side hash fragment.** Wouldn't work for OG image generation, which needs a server-fetchable URL.

**Evidence.** `supabase/migrations/003_share_cards.sql`, `app/api/share/route.ts`, `app/clear/[id]/page.tsx`, `app/clear/[id]/opengraph-image.tsx`. Apr 8 session memory.

---

## 2026-04-07 — Energy matching replaces time-of-day signal

**Decision.** Mood/time pairing is now driven by an explicit Low / Medium / High **energy** picker, not by the current time of day.

**Why.** Time of day was a weak proxy for what it was trying to measure: "how much brain do I have for this right now?" Someone could be on the couch at 2pm with nothing left in the tank, or at 11pm fully wired. Asking the user directly ("what's your energy like?") gets a better signal in one question than inferring from the clock. It also removes a whole category of "but it's 3pm" edge cases from the recommendation logic.

**Rejected.**
- **Keep time-of-day.** Drifted against user reality too often.
- **Combine both** (time-of-day as prior, energy as override). Extra complexity for no meaningful win — energy alone is already the better signal.

**Note on gap.** The original in-session reasoning was not fully captured in memory. The "why" above is reconstructed from the product thesis. If this needs to be revisited, verify against the Apr 7 commit history.

**Evidence.** Apr 7 session memory, V3 decision engine #5.

---

## 2026-04-07 — Typography floor: 12px minimum across the app

**Decision.** Every 10px and 11px font-size in the codebase was bumped to 12px+ across 25+ components in one sweep.

**Why.** 10-11px is below most accessibility guidance for body text and gets punishing on high-DPI phones in outdoor light. The app is used on phones by people who are trying to decide what to play, which often means eyes-tired, end-of-day conditions. Readability is a quiet but cumulative quality gate — every individual 10px use looked "fine" in isolation, but the aggregate was making the app feel cramped.

**Rejected.**
- **Keep 10-11px for secondary metadata.** Would perpetuate the drift. A floor rule only works if it's a floor.
- **Add a user-controlled font-size toggle only.** Does nothing for the default experience most users see.

**How to apply this.** 12px is the floor. Do not introduce new 10px or 11px sizes unless there is a specific, reviewed reason. The comfortable text-size toggle (also shipped Apr 7) is an *additional* bump on top of the floor, not a replacement for it.

**Evidence.** Apr 7 session memory "Typography pass" section.

---

## 2026-04-06 — Playing Now cap is 3 games, enforced at every entry point

**Decision.** A user cannot have more than 3 games in the Playing Now state. The cap is enforced at every entry point: `moveGameForward`, Reroll, StalledGameNudge, FinishCheckNudge, JustFiveMinutes, playAgain. Hitting the cap surfaces a "pick one to finish or move on" nudge.

**Why.** Playing Now is supposed to mean "games I am *actually* playing right now." Without a cap, users drift into marking 10+ games as Playing Now, which defeats the purpose of the state — it turns into a soft wishlist and the shelf loses its meaning. Three is small enough to force a real choice and large enough to accommodate "main game + palate cleanser + something with a friend."

**Rejected.**
- **No cap.** Was the default and immediately drifted in testing.
- **Cap = 1.** Too restrictive. Real players genuinely rotate between 2-3 games.
- **Cap = 5.** Numerically within range but large enough to re-enable the drift problem.
- **Enforce the cap in one place.** Users can enter Playing Now from six different UI flows. Enforcing centrally was the only way to stop leaks.

**How to apply this.** If a new flow lets a user mark a game as Playing Now, it must go through the same cap check. No direct state writes. When in doubt, check the existing entry points as reference.

**Evidence.** Apr 6 session memory "Deploy 5" section.

---

## 2026-04-06 — Skip tracking thresholds: 3+ = penalty, 5+ = soft-ignore

**Decision.** When a user skips a game during reroll, the count is tracked in localStorage. At 3+ skips, the game gets a 50% weight penalty in future rolls. At 5+ skips, it is soft-ignored (eligible for the pool but almost never picked). A reset button appears in the game detail view at 3+ skips so users can undo accidental penalties. A 💤 indicator shows on soft-ignored cards.

**Why.** Without tracking, the reroll kept surfacing games the user had already rejected, which trained them to distrust the picker. Hard-hiding a game at 1 skip would feel over-eager — sometimes users skip because the mood doesn't fit *today*, not because they hate the game. The 3/5 two-step gives a soft signal first (penalty) and a strong signal second (soft-ignore), with an escape hatch if the user wants to give it another chance.

**Rejected.**
- **Hard-hide at first skip.** Too aggressive. Trains the user to be afraid of skipping.
- **Single threshold.** Loses the "soft signal first, strong signal second" behavior.
- **No reset affordance.** Users would feel trapped by their own accidental skips.

**How to apply this.** The 3/5 thresholds are tunable but changing them requires thinking about what the user is telling you with a skip. Don't change them just because "5 feels high" — verify against actual user behavior if/when data is available.

**Evidence.** `lib/skipTracking.ts`, `lib/reroll.ts`, `components/Reroll.tsx`. Apr 6 session memory.

---

## 2026-04-05 — .claude tooling: path-scoped rules and on-demand skills

**Decision.** Claude Code rules are path-scoped (loaded only when working in their area) and skills are on-demand (loaded only when explicitly invoked). The plan file was restructured for a 94% size reduction.

**Why.** The prior session crashed on an oversized context error. Everything that *could* be loaded *was* being loaded on every turn, which ate context and eventually crashed the session entirely. Path-scoped rules mean brand/voice rules only load when touching copy files, legal rules only load when touching data/feature files, etc. Skills are gated behind explicit invocation so the default context is small.

**Rejected.**
- **Keep everything global.** Crashed the session.
- **Shrink by deleting rules.** The rules are load-bearing — the problem wasn't their content, it was that they were all loading at once.
- **Lazy-load via summaries.** Summaries drift from reality. Full files scoped by path stays accurate.

**How to apply this.** New rules go in `.claude/rules/` with a path scope. New skills go in `.claude/skills/<name>/SKILL.md` and are invoked explicitly. Resist the urge to make things "always on" — that pattern is what crashed the session in the first place.

**Evidence.** `.claude/rules/`, `.claude/skills/`. Apr 5 session memory.

---

## 2026-04-04 — "Bailing on a game is a decision" becomes the brand thesis

**Decision.** The product officially celebrates the act of *deciding not to play a game*, not just the act of finishing it. The language evolved over the next weeks (Apr 8: "Give up" → "Not for me"; Apr 9: "bail" retired, "Moved On" locked), but the *principle* was crystallized in a Discord conversation between Brady and Nate on Apr 4.

**Why.** The origin is a raw, unfiltered quote from Brady explaining the app to Nate:

> *"celebrating bailing on a game — that's a decision that's been made. i'm not gonna play that or try. that's a win. that's progress"*

and:

> *"we help you make the decision so the identity pressure you may or may not be subconsciously feeling is lifted"*

This is the emotional payload of the entire product. Users who hoard games feel identity pressure — the "I should play this" that outlasts the desire to play it. Most tracker apps either ignore that pressure or amplify it with guilt mechanics. Inventory Full's differentiation is that it names the pressure and gives the user permission to put the game down.

**How to apply this.** Any feature that touches the move-on flow, the celebration flow, or any UI where a user declines a game should be measured against this principle: does it *lift* identity pressure, or does it *add* it? "Sure you want to quit?" adds pressure. "Moving on is deciding too." lifts it.

**Note on provenance.** These quotes came out of an unscripted DM conversation, not a brand doc. That's part of the point — the thesis is what Brady says when he's not trying to write marketing.

**Evidence.** `feedback_discord_nate_apr2026.md` in the prior-session memory. Downstream: Apr 8 "Not for me" label, Apr 9 "bail" retirement and "Moved On is deciding too" step-3 copy.

---

## 2026-04-03 — "What Should I Play?" must dominate the main page; everything else is secondary

**Decision.** The main page is not a dashboard. It is a decision surface. The "What Should I Play?" action gets the gravitational center of the page. Stats panel, Pile Collector, library value, daily burn rate, quick sort, shelves, filters — all secondary, collapsible, or below the fold.

**Why.** An external product review flagged that the main page was doing too many jobs at once, and the density was fighting the app's own thesis. The product's axiom is *"spend less time here, more time playing."* A dashboard with eight equal surfaces on first load makes the user spend orientation time parsing the UI before they can even start the action that would get them out of the app. That is a direct contradiction of the core loop.

**Rejected.**
- **Treat the dashboard as a destination.** Competitor apps (tracker-style) do this. It is the wrong pattern for this product because we don't *want* to be a destination.
- **A/B test layouts.** Not enough users yet for A/B anything. The decision is a principle, not a metric question.

**How to apply this.** When building any new main-page feature, ask: does it compete with "What Should I Play?" for attention? If yes, it belongs behind progressive disclosure (collapsible section, secondary tab, below the fold). The roll modal and celebration modal get high emotional register — the main page should either match that register around the decision action, or stay flat and let the action stand alone.

**Evidence.** `project_external_review_apr2026.md` in the prior-session memory.

---

## 2026-04-02 — Anti-gamification: the goal is to get users OFF the app

**Decision.** Inventory Full will not optimize for time-in-app, streaks, endless feeds, or any engagement mechanic that keeps a user scrolling instead of playing. Features that add app-time without adding play-time are treated as suspect and reviewed against the core loop.

**Why.** This is the philosophical spine of the product and it is counter to almost every instinct the software industry teaches. Most apps are measured on DAU and session length, and gamification is the standard lever to improve both. For this product, those metrics would mean the product is failing — a user who spends twenty minutes in Inventory Full and then watches YouTube instead of playing a game is a user the product failed. The success metric is the opposite: user opens app, makes a decision, closes app, plays a game, comes back only when they need the next decision.

Brady and Nate independently arrived at the same framing: *"easy to lure someone INTO an app. hard to get them OUT of it."* The hard problem — and the defensible one — is the OUT part.

**Rejected.**
- **Streaks.** "Play every day!" mechanics are the canonical anti-pattern. Would turn the app into homework and punish users for skipping a day.
- **Endless feed of recommendations.** "Infinite scroll" for games is scroll-paralysis dressed up as choice.
- **Push notifications to drive return visits.** Would violate the thesis AND trigger the legal-compliance "requires explicit opt-in" rules.
- **Leaderboards, social compare, productivity-dungeon stats.** All turn the app into a new backlog.

**How to apply this.** Run `/feature-creep-audit` before adding features that could slide into engagement-bait. If a proposed feature's success metric is "user spends more time in the app," that is a signal to reject or redesign. The design principle baseline: *every extra minute in Inventory Full should justify itself against a minute that could have been spent playing.*

**Evidence.** `feedback_discord_nate_apr2026.md`, `project_competitive_analysis_apr2026.md`. Encoded as `.claude/rules/brand-messaging.md` "The Anti-Overgamification Stance" section.

---

## 2026-04-02 — Moat is decision quality and momentum, not tracker features

**Decision.** When prioritizing features, weight decision-engine and momentum loop features over tracker/social/organization features. The competitive moat is positioning + decision quality, not feature-checklist parity with trackers.

**Why.** An external competitive analysis found that Inventory Full's moat was thin — positioning and tone were differentiated, but the *product* was uncomfortably adjacent to existing trackers (Backloggd, Grouvee, GameTrack) and recommendation engines (Playbacklog). The strategic danger was drifting into "another tracker with a nicer tone," where every new tracker feature (shelves, stats, sorting, social) moves the product toward commodity and erodes the thing that actually differentiates it.

Five moat-building areas were ranked by defensibility:
1. Decision quality (inference-based, not just random filters)
2. Momentum design (nudges, return loops, progress visibility)
3. Payback/value framing
4. Low-friction triage (import-to-playing speed)
5. Humane tone

Tracker features (better shelves, more sort options, social compare, import more platforms) rank *nowhere* on this list. They are commodity features. Every hour spent on them is an hour not spent on the moat.

**How to apply this.** Before building a proposed feature, ask: *"Does this make our recommendations smarter or our momentum loop stickier?"* If the answer is no, it's a tracker feature and deprioritize. Exception: foundational features that unblock the moat (import flows, basic library management) are worth shipping but shouldn't expand beyond what the moat needs.

**Evidence.** `project_competitive_analysis_apr2026.md` in the prior-session memory.

---

## 2026-04-01 — No manual categorization: the app infers, users don't tag

**Decision.** Users never have to manually pre-tag, pre-categorize, or pre-organize games in their library before the app can help them. Mood tags, session length, quality signals, and shelf assignments are auto-inferred from public data (RAWG for genres → moods, HLTB for session length, Metacritic for quality). Users query by mood/time at the *point of decision*, not by organizing their library up front.

**Why.** Brady tested the app as a new user and discovered that mood filters, time tiers, and shelves all required manual per-game assignment to be useful. The dropdowns did nothing. Filters showed empty results because nothing was pre-tagged. A user with 300 games was being asked to do 300 small categorization tasks *before* the app would help them. That is the exact opposite of the product's promise, and Brady named it precisely: *"micromanagement porn disguised as pile clearing."*

This is the single biggest paradigm shift in the app's history and almost every feature decision since has followed from it.

**Rejected.**
- **Manual tags with "helpful" prompts.** Still asks the user to do work they will never do.
- **Onboarding flow that asks users to tag their top 10.** Still work. Still a drop-off.
- **Hybrid: auto-infer with "correct me if I'm wrong" prompts.** The correction prompts become their own micromanagement surface. Trust the inference.

**How to apply this.** Any proposed feature that requires users to manually categorize, rate, tag, or organize games on a per-game basis gets immediate scrutiny. The burden of proof is high: the feature must either (a) be completely optional with zero impact on the core flow if skipped, or (b) be auto-populated from public data with user correction as an edge case.

**Follow-on.** This decision is what made enrichment (RAWG, HLTB, Metacritic) load-bearing infrastructure instead of a nice-to-have. If enrichment breaks, the core loop breaks. See `docs/scale-up-plan.md` for the sustainability tiering around enrichment API limits.

**Evidence.** `feedback_no_manual_categorization.md` in the prior-session memory. Downstream: every mood/time/quality signal in the app is auto-populated; the mood picker at pick-time is the only user-facing categorization surface and it acts on a single game, not the whole library.

---

## 2026-05-13 — Monetization plan corrected; Year-in-Pile chosen as Dec 2026 paid moment

**Decision.** The locked 2026-05-04 monetization plan was audited mid-launch-day after repeatedly producing the same stalled outcomes on affiliate work. Eight internal contradictions and unexamined assumptions were corrected in-place via an Amendments section in `docs/monetization-plan.md` — the headline shifts: cosmetic-only subscriptions are explicitly allowed (Letterboxd Pro analog reconciled with the previous hard-NO), the Supporter Tier B/C trigger ("first organic $5 tip") was recognized as circular and replaced with "audience signal," the affiliate gate moved from an arbitrary ≥1k MAU to a real-economics gate ("RAWG-cost-coverable revenue ≈2.5k MAU OR free-commercial metadata path"), the Ko-fi progress widget was dropped (zero-counter optics), and direct affiliate partners (Fanatical/Humble/GMG direct, GOG via AdTraction — not CJ) were specified.

Year-in-Pile was added as a new monetization stream and identified as the strongest near-term bet — $5 one-time unlock, Dec 1 2026 launch deadline (calendar-fixed by Spotify Wrapped's seasonal slot), 11-beat scrollable walkthrough + MP4 export via MediaRecorder as the viral asset. Build window Sep–Nov 2026. Spec at `docs/year-in-pile-spec.md`.

IGDB was investigated and ruled out as a RAWG escape — verified via web search that IGDB also requires a commercial agreement past free tier. Same gate, different gatekeeper.

**Why.**
- The plan was a year old and load-bearing on Brady's mental model, but never red-team'd hard. The contradictions (subscription hard-NO while citing Letterboxd Pro elsewhere) had been sitting there untriggered.
- The "wait for first organic $5 tip" trigger was mathematically uncircularable — without monetization visible, no organic tip arrives, so the trigger never fires. We'd been kicking the same can repeatedly without naming the recursion.
- Year-in-Pile is the rare monetization surface that aligns with our anchor principles (free-forever core preserved, doesn't gate decisions, inherently viral, reuses existing share-card infra) AND has a proven model (Spotify Wrapped et al). Identified as the single highest-leverage near-term build.
- Real revenue math at our scale (1–2% conversion × ~$3 commission) shows affiliate is a $89/mo loss at 1k MAU due to RAWG's $149/mo commercial floor. The original ≥1k MAU gate was a guess; the corrected gate is a calculation.

**Implementation.**
- `docs/monetization-plan.md` — full Amendments section at the bottom of the file with traceability for all 8 corrections. New streams (Cosmetic Premium Subscription, Year-in-Pile) inserted as #5 and #6.
- `docs/year-in-pile-spec.md` — new build-ready spec (~470 lines), all key decisions made (pricing, free/paid split, timeline, virality mechanics).
- Memory: `~/.claude/projects/.../memory/feedback_check_index_first.md` — feedback rule logged to prevent future Claude sessions from reinventing planning work that's already in INDEX.md.

**Rejected.**
- Continuing to defer affiliate work to "after launch" without examining the economic gate. Would have produced another stalled affiliate sprint in 4–6 weeks.
- IGDB migration to escape RAWG commercial cost. Web-verified equivalence — not an escape, just a different vendor relationship.
- A Stripe-subscription Supporter tier (initial recommendation before reading the locked plan). The plan already specced one-time Ko-fi tip tiers; a parallel subscription would be redundant. The new Cosmetic Premium stream is *distinct* from one-time supporter tiers — different product, different mental model.

**Drift risk.** The locked monetization plan now has both an original body (2026-05-04) and an Amendments section (2026-05-13). Future sessions must read the Amendments first when in doubt — the body is preserved for context but the Amendments section is the source of truth on any conflict. Marked explicitly in the doc.

---

## 2026-05-20 — Xbox import: all games default to Backlog

**Decision.** Xbox imports now always set status to `buried` (Backlog), regardless of achievement completion percentage. Previously, 100% achievements auto-set `played` (Completed).

**Why.** The Completed tab is the user's showcase of games they beat *using Inventory Full* — it's the app's success metric. Auto-completing games based on external achievement data steals that moment. A user with 100% achievements may still consider the game active (replaying, DLC, etc.). The user decides when something is done, not us.

**LOCKED.** This is the third time this pattern has been caught and rolled back (Xbox achievements, Steam HLTB inference). The principle: never auto-assign Completed, Up Next, or Moved On from heuristics. Imports default to Backlog. Period.

---

## 2026-05-20 — /preview-landing route is intentional

**Decision.** `app/preview-landing/page.tsx` is a static duplicate of the landing page for Brady to preview while logged in (the real landing redirects to the app when authenticated).

**Why.** Without this, there's no way to see the current landing page without logging out. Dev convenience, not user-facing.

---

## 2026-05-20 — Remove behavioral nudges (StalledGameNudge, FinishCheckNudge)

**Decision.** Deleted both nudge components. They showed proactive prompts on the Backlog tab: one for games untouched in 14+ days, one for games at 85%+ estimated completion.

**Why.** Both add cognitive load the user didn't ask for. FinishCheckNudge used `hltbMain - hoursPlayed` to estimate progress — the same inference pattern we've rolled back elsewhere. StalledGameNudge was gentler but still uninvited. The app's job is to help when asked, not to nag. If a user opens the app, the picker is right there.

---

## 2026-05-20 — Void mode contrast bumped to WCAG AA

**Decision.** Raised void mode text colors from near-invisible (#222–#444) to readable-but-muted (#777–#999). Still the dimmest theme by far, but now meets 4.5:1 contrast on all text.

**Why.** WCAG AA is non-negotiable per project rules. The void aesthetic trades some of its "barely there" vibe for accessibility. The muted palette still reads as minimal.

---
