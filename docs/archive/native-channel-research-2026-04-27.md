# Native-Channel Launch Research — 2026-04-27

Input for the follow-up implementation sprint. Steam and EA App are settled (Steam shipped, EA dead). PSN/Switch are informational-only. This doc covers Xbox PC + Cloud, Epic, Battle.net, Ubisoft Connect, plus a verification pass on GOG Galaxy.

## Summary table

| Platform | Scheme | ID source | Reliability | Ship priority |
|---|---|---|---|---|
| Xbox Cloud (web) | `https://xbox.com/<locale>/play/games/<slug>/<productId>` | Microsoft Store displaycatalog API (titleId → productId) | High for Game Pass Ultimate users with cloud entitlement; works in browser, no client needed | **1** |
| Xbox PC app (native) | `msxbox://` (and aggregated-library protocol, evolving) | productId / package family name | Medium — protocol is registered by Xbox app, but Microsoft has not published a stable per-game launch URI; community reports inconsistent results | 4 (defer) |
| Epic Games | `com.epicgames.launcher://apps/<SandboxID>:<CatalogID>:<ArtifactID>?action=launch` (current) — old `apps/<ArtifactID>` is deprecated and removed in recent client builds | Epic GraphQL store API; community wrappers (`epicstore_api`) expose `{namespace: slug}` and Sandbox/Catalog/Artifact triples | High when triple is correct; Win/Mac only | **2** |
| Battle.net | `battlenet://<productCode>` *or* CLI `--exec="launch <code>"` (web protocol handler is the URL one) | Hardcoded short list (~20 codes total — Blizzard's whole catalog fits in a switch statement) | High — small fixed catalog, codes are public and stable | **3** |
| Ubisoft Connect | `uplay://launch/<gameId>/0` | Windows Registry on user's machine, OR community-maintained ID maps on GitHub (e.g. RizSavio/UplayGameIDs) | High on Windows; scheme is long-standing and widely used | **5** |
| GOG Galaxy | `goggalaxy://openGameView/<gameId>` confirmed; `installGame`, `launchGame` also exist | GOG product slug/id from public store; per-user game folder `__support/<id>` | Medium — GOG hasn't formally published the protocol spec; community-verified | Bonus (cheap to add) |

## Xbox (PC + Cloud)

**Two distinct surfaces, treat separately.**

### Cloud (the easy win)
- URL: `https://www.xbox.com/<locale>/play/games/<slug>/<productId>` — example `https://www.xbox.com/en-US/play/games/metal-slug-tactics/9NGNZP1J1JN7`. Slug is cosmetic; productId is the load-bearing part.
- Works in any browser, no Xbox app required, no protocol prompt. Game Pass Ultimate (or per-title cloud entitlement) gates the actual play.
- This is the highest-leverage Xbox button: opens to a "Play" CTA on a real Microsoft URL, zero client deps.

### PC app (native)
- The `msxbox://` protocol is registered by the Xbox PC app (confirmed via the [Xbox One Research wiki protocol-URI list](https://xboxoneresearch.github.io/wiki/operating-system/protocol-URIs/)). Other registered schemes: `xbox-gamehub://`, `ms-xbox-dashboard://`, `library://`, `ms-windows-store://`.
- Microsoft has **not** published a stable, documented per-game launch URI for Xbox PC. The Xbox app's own "aggregated library" feature (rolled into Insiders mid-2025, broader 2026) is internal — third parties cannot drive it via URL.
- Recommendation: skip native-app launch for v1. Cloud URL covers ~all Game Pass users, and the app launch UX is fragile.

### titleId → productId resolver
- Endpoint: `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=<productId>&market=US&languages=en-US` — but this takes Big IDs as input, not Title IDs.
- There is no clean public titleId → productId conversion. Options:
  1. **Best:** when importing from OpenXBL, also pull the Microsoft Store productId from the same flow if available, OR resolve at import time via Store search by title name → first-result productId.
  2. **Fallback:** maintain a community map. The repo `lucasromerodb/xbox-store-api` and `0x14307/XboxStoreAPI` both scrape the public store; we can build a one-time titleId→productId index at import time and cache.
- For v1, **do title-name → productId resolution against displaycatalog at import time and cache the productId on the game record.** Don't try to do it at click time.

**Ship-ready?** Yes for Cloud. No for native PC app — defer.

## Epic Games Store

- Current scheme (post-2024 launcher rebuild): `com.epicgames.launcher://apps/<SandboxID>:<CatalogID>:<ArtifactID>?action=launch&silent=true`. The old single-segment form (`apps/<ArtifactID>`) was removed and breaks on current clients (see [r2modmanPlus #1973](https://github.com/ebkr/r2modmanPlus/issues/1973), [Heroic #3342](https://github.com/Heroic-Games-Launcher/HeroicGamesLauncher/issues/3342)).
- Store-page variant: `com.epicgames.launcher://store/p/<slug>` opens the launcher to that product's store page.
- ID source: Epic's GraphQL endpoint `https://graphql.epicgames.com/graphql` exposes catalog. The Python wrapper [`SD4RK/epicstore_api`](https://github.com/SD4RK/epicstore_api) returns `{namespace: slug}` mappings and full Sandbox/Catalog/Artifact triples. We can pre-build a name → triple map (single nightly cron, store JSON in `lib/`).
- Reliability: Win/Mac only; Linux users typically use Heroic which intercepts the same scheme. Browser shows a "Open Epic Games Launcher?" prompt — same UX as Steam.
- ToS: Epic's protocol activation page documents this as the supported deep-link mechanism. No third-party prohibition surfaced.

**Ship-ready?** Yes, with a name → triple lookup map built from the GraphQL catalog. If we want to ship faster: ship the `store/p/<slug>` form first (only needs a slug), then upgrade to direct-launch once the triple map is in place.

## Battle.net

- URL form: `battlenet://<productCode>` (the launcher registers the `battlenet://` handler and accepts the short product code).
- CLI form (more reliably documented): `Battle.net.exe --exec="launch <code>"`. We use the URL form for web → client handoff.
- Product codes are a closed list of ~20, all public:
  - `wow`, `wowclassic`, `wow_classic_era` — World of Warcraft variants
  - `d3`, `d4`, `di` — Diablo 3, 4, Immortal
  - `s1`, `s2` — StarCraft Remastered, StarCraft 2
  - `hs` — Hearthstone
  - `pro` — Overwatch 2 (was `ow`/`pro` rename history; current is `pro`)
  - `hero` — Heroes of the Storm
  - `w3` — Warcraft 3 Reforged
  - `viper` — Call of Duty: Modern Warfare/Black Ops series (CoD codes change per title — verify per game)
  - Plus PTR variants
- See [bnetlauncher](https://github.com/dafzor/bnetlauncher) and [SteamBattleNetLauncher](https://github.com/jayclassless/SteamBattleNetLauncher) for the canonical community lists; we can hardcode this — Blizzard's whole launcher catalog fits in a 25-row constant in `lib/`.
- Reliability: stable and widely used. Codes are case-sensitive. Battle.net Beta client had brief regressions ([bnetlauncher #13](https://github.com/dafzor/bnetlauncher/issues/13)) but resolved.

**Ship-ready?** Yes. Hardcode the table, match on game name from import. Lowest-effort platform of the four.

## Ubisoft Connect

- Scheme: `uplay://launch/<gameId>/0` — second segment (`/0`) is required, indicates default mode/no DLC.
- ID source:
  - **Per-user, exact:** Windows Registry under Ubisoft's keys lists installed game IDs (per [RizSavio/UplayGameIDs](https://github.com/RizSavio/UplayGameIDs)).
  - **For us (server-side, no user machine access):** community-maintained list at `RizSavio/UplayGameIDs` and similar repos provides game-name → uplay-ID. We'd snapshot this into a JSON file in `lib/`.
- Reliability: Windows-only client (macOS support has been spotty/broken at times). Long-running scheme, still functional in 2024–2026 per active community projects.
- No third-party deep-link prohibition found. Ubisoft's own help docs reference the launch options pattern.

**Ship-ready?** Yes for Windows. Honest fallback for Mac users: link to Ubisoft Connect web product page.

## GOG Galaxy (verification)

- Confirmed: `goggalaxy://openGameView/<gameId>` works. Other verbs exist: `installGame/<id>`, `launchGame/<id>` (`launchGame` is the actual play action; `openGameView` opens the game's Galaxy page).
- For a "play now" button, prefer `goggalaxy://launchGame/<id>` with `openGameView` as the fallback if `launchGame` reports unreliable per the GOG forums.
- ID source: GOG product page URL slug → numeric ID via GOG's public API (`api.gog.com/products/...`) or per-user `__support/<id>` folder. For our use case, snapshot via API at import time.
- GOG has not formally published the Galaxy protocol spec ([GOG wishlist item](https://www.gog.com/wishlist/galaxy/publish_galaxy_protocol_specification)) — we're relying on community-verified behavior. Low risk of removal but not contractually stable.

## Recommended ship order + rationale

1. **Xbox Cloud (web URL)** — highest user impact (covers Game Pass Ultimate cohort, biggest slice of remaining 30%), zero client dependency, browser-native UX, no protocol prompt. Just need the productId resolver path, which we can do at import time.
2. **Epic Games (store-page form first, direct-launch second)** — second largest cohort. Ship `com.epicgames.launcher://store/p/<slug>` immediately (slug-only), upgrade to direct-launch once the catalog triple map exists. Two-stage ship splits the work cleanly.
3. **Battle.net** — smallest catalog (~20 codes), highest confidence per implementation hour. Hardcoded table, name match, done. Ships the same day as Epic's first stage.
4. **GOG Galaxy** (bonus) — community-verified, cheap to add alongside the others. Low user count but it's a goodwill win for the GOG faithful and the implementation is trivial once the others are done.
5. **Ubisoft Connect** — Windows-only, smaller library footprint, requires snapshotting a community ID map. Ship after the top three are stable.
6. **Xbox PC app (native)** — defer indefinitely. The cloud URL already serves the Xbox cohort, and the native protocol is unstable. Revisit when Microsoft publishes a documented per-game URI.

### Cross-cutting implementation notes

- **Safari custom-scheme behavior:** Safari blocks/prompts on non-https custom schemes more aggressively than Chrome/Firefox. For all four native schemes (`com.epicgames.launcher://`, `battlenet://`, `uplay://`, `goggalaxy://`), expect a confirmation dialog the first time on macOS Safari, and silent failure on iOS Safari. Xbox Cloud's `https://xbox.com/...` URL avoids this entirely — another reason it's #1.
- **Game-not-installed fallback:** every native scheme silently fails (or shows a launcher install prompt) if the launcher isn't on the device. Pair every native button with a small "Don't have [Launcher]?" link to the official client download.
- **Attribution / ToS:** none of the four platforms surfaced explicit prohibitions on third-party deep-linking. We're not driving purchases, not surfacing affiliate links from these buttons, and the user already owns the games — we're firmly in the "user-initiated launch of user-owned content" lane. No Privacy Policy update required (we're not sending user data anywhere new — these are client-side `window.location` redirects).
- **Sentry instrumentation:** add a single event `native_launch_attempt` with `{platform, scheme_form}` so we can see which platforms users actually click.

## Sources

- [Xbox One Research Wiki — Protocol URIs](https://xboxoneresearch.github.io/wiki/operating-system/protocol-URIs/)
- [Xbox Cloud Gaming on Xbox.com](https://www.xbox.com/en-us/play/games/metal-slug-tactics/9NGNZP1J1JN7)
- [Microsoft Store Service APIs (displaycatalog)](https://learn.microsoft.com/en-us/gaming/gdk/docs/store/commerce/service-to-service/microsoft-store-apis/xstore-nav)
- [lucasromerodb/xbox-store-api](https://github.com/lucasromerodb/xbox-store-api)
- [Epic Protocol Activation docs](https://dev.epicgames.com/docs/epic-games-store/protocol-activation)
- [Epic deprecated URI scheme issue (r2modmanPlus #1973)](https://github.com/ebkr/r2modmanPlus/issues/1973)
- [SD4RK/epicstore_api](https://github.com/SD4RK/epicstore_api)
- [dafzor/bnetlauncher](https://github.com/dafzor/bnetlauncher)
- [jayclassless/SteamBattleNetLauncher](https://github.com/jayclassless/SteamBattleNetLauncher)
- [wowdev.wiki Agent docs (Battle.net product codes)](https://wowdev.wiki/Agent)
- [RizSavio/UplayGameIDs](https://github.com/RizSavio/UplayGameIDs)
- [Ubisoft launch options support article](https://www.ubisoft.com/en-us/help/connectivity-and-performance/article/setting-launch-options-for-ubisoft-games-in-ubisoft-connect-pc/000062077)
- [GOG Galaxy protocol forum thread](https://www.gog.com/forum/general/how_to_find_galaxy_id)
- [GOG SDK docs](https://docs.gog.com/galaxyapi/)
