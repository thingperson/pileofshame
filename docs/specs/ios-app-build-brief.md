# Inventory Full — iOS Build Brief (Native SwiftUI)

*Phase 0 + Phase 1 · Free tier to App Store · v1.0 · May 2026*

---

## How to read this doc

This is the tactical execution spec for the iOS app. Every locked decision includes the reasoning so future sessions don't re-litigate. If a section says "locked," don't reopen it without Brady explicitly asking.

The web app at inventoryfull.gg is the reference implementation. The existing TypeScript codebase (`lib/`, `components/`, `app/`) serves as the detailed spec for translation — not as shared code. No file-level code sharing between web and iOS is possible or intended.

For the strategic frame (premium scope, what we're not building), see the original brief in `notes/inventory-mobile-app-full-build-brief.md`.

---

## Locked decisions

All decided 2026-05-20 unless otherwise noted. Don't re-litigate without specific cause.

### Architecture: Native SwiftUI (not Capacitor)

Full native rewrite in Swift/SwiftUI. The app has 5-6 core screens — small enough that native is feasible. More than half the iOS-differentiating features (widgets, Siri, share extension, OAuth, Keychain) require native Swift regardless. Going native eliminates:
- WebView performance issues (scroll jank, animation uncanny valley)
- Capacitor plugin dependency maintenance
- Bridge layer debugging complexity
- Static export blocker (Next.js API routes + server components can't export cleanly)
- Apple Guideline 4.2 "just a website" rejection risk

The existing TypeScript is the translation spec. Logic translates mechanically; UI is reimagined in SwiftUI idioms, not pixel-copied.

### Separate GitHub repository

The iOS app lives in its own repo (`inventoryfull-ios`), not in the web repo. Reasons:
- **Different language/toolchain.** Swift/Xcode vs TypeScript/Next.js. No file-level code sharing.
- **Xcode projects are heavy.** `.xcodeproj/`, build artifacts, provisioning profiles would pollute the web repo.
- **Different deploy cadences.** Web: `git push` = instant Vercel deploy. iOS: build → TestFlight → App Store Review (days/weeks).
- **Clean blast radius.** A bad iOS commit can't break the production web app.

Specs and decisions stay in the web repo (canonical home). The iOS repo's README links back here.

**Repo:** https://github.com/thingperson/inventoryfull-ios

### Full import, no game cap

All platforms import the full library with no artificial cap on the free tier. Premium gates capabilities (intelligence layer, cloud sync, Year-in-Backlog), not library access.

**Why:** The 100-game cap was evaluated and rejected. It contradicts "we're on your side" brand positioning. Gaming communities are hypersensitive to "pay to access your own data" patterns. The web version has no cap — the iOS app shouldn't be worse.

### One-time purchase at $9.99

No subscription, ever. The app's inverted success metric (less time in app = success) structurally conflicts with subscription retention — users who succeed stop opening the app, which is the exact moment they'd cancel.

$9.99 is supported by:
- RevenueCat 2026 data: higher-priced apps convert better (2.8% median vs 1.4% low-price)
- Comp positioning: GameTrack lifetime $99.99, GG $4.99/mo. We're the obviously fair option.
- "Under $10" is the strongest mobile impulse-purchase anchor
- Target audience (100+ game owners) routinely spends $15-60 per game

Unlocks (Phase 2): intelligence layer, cloud sync, Year-in-Backlog, future capabilities.

### Tip jar (post-milestone)

Consumable IAPs at $2.99 / $6.99 / $14.99. Surfaced once after a meaningful milestone (first completion, first Month-in-Review), never during onboarding. Multiple tiers outperform single "supporter" options — users choose higher-value tips when given choices.

### Phasing

Free tier ships to App Store first. Premium intelligence layer is Phase 2 (separate brief). Android is Phase 3.

### Auth on iOS

`ASWebAuthenticationSession` for PSN and Xbox OAuth. Sign in with Apple for the account system (Phase 2). Steam uses its existing web OAuth flow via `SFSafariViewController`.

### Storage

- **Game library + settings:** SwiftData (local, authoritative — same as web's localStorage model)
- **OAuth tokens:** iOS Keychain via Security framework (never UserDefaults, never plaintext)
- **Widget data:** App Group shared container
- **Backend (Phase 2):** Supabase for accounts, cloud sync

### Platforms in v1

Steam + Xbox + PSN auto-import. Switch + Epic + GOG + physical as manual add. Playnite CSV stays.

### Things we are explicitly not building

- Push notifications
- Streaks or badges
- Switch reverse-engineered API
- Account creation in Phase 1 (free tier stays accountless)
- Any engagement mechanics that increase time-in-app without terminating in play

---

## Tech stack

### Languages & frameworks

| Technology | Purpose | Why this over alternatives |
|---|---|---|
| **Swift 6** | App language | Required for native iOS. Modern concurrency (async/await) maps well to existing TypeScript patterns. |
| **SwiftUI** | UI framework | Declarative, pairs with SwiftData, native animations, widget/extension support. UIKit has more escape hatches but SwiftUI is sufficient for our screen count. |
| **SwiftData** | Local persistence | Apple's modern persistence layer (iOS 17+). Simpler than Core Data, Swift-native, works with SwiftUI's `@Query` macro. Stores the game library (authoritative local data — mirrors web's localStorage model). |
| **WidgetKit** | Home/lock screen widgets | Only way to put content on iOS home screen. Requires Widget Extension target. |
| **App Intents** | Siri shortcuts | Modern replacement for SiriKit Intents. "What should I play?" voice command. |
| **AuthenticationServices** | OAuth flows | `ASWebAuthenticationSession` for PSN/Xbox. `SignInWithApple` for Phase 2 accounts. Apple's sanctioned auth path — no third-party auth SDKs. |
| **Security framework** | Keychain access | Store OAuth tokens. Native, no third-party dependency needed. |
| **StoreKit 2** | IAP (Phase 2) | One-time purchase ($9.99 premium) + tip jar consumables. Modern Swift-native API. |

### iOS deployment target: 17.0+

Gives us: modern WidgetKit (lock screen widgets), App Intents, SwiftData, StoreKit 2, `ASWebAuthenticationSession` improvements. Matches PSN GO's bar. Covers 90%+ of active iOS devices as of 2026.

### Third-party Swift packages (minimal)

| Package | Purpose | Install via |
|---|---|---|
| **sentry-cocoa** | Error monitoring (matches web Sentry setup) | Swift Package Manager |
| **Firebase Analytics** (optional) | GA4 event tracking on iOS (picker_selection, OAuth completion, retention) | SPM. Can defer to Phase 1 if App Store Connect analytics suffice for Phase 0. |

No other third-party dependencies planned. URLSession for networking, SwiftUI for UI, SwiftData for persistence — all Apple-native. Fewer deps = fewer things to break.

### Backend services (shared with web)

| Service | Role | iOS-specific notes |
|---|---|---|
| **Supabase** | Database, Edge Functions, future auth/sync | PSN token exchange MUST go through a server (client secret can't live in app bundle). Supabase Edge Function handles this. Feedback + share snapshots already in Supabase from web. |
| **RAWG API** | Game metadata, genres, covers | Called directly from iOS via URLSession. API key bundled in app (not sensitive — read-only, rate-limited). |
| **HLTB** | Completion time estimates | Called directly from iOS. Same scraping/API approach as web. |
| **Steam API** | Library import, playtime | Direct call from iOS after OAuth. Public API key. |
| **OpenXBL** | Xbox library, achievements | Direct call from iOS. API key in app bundle. |
| **psn-api pattern** | PSN library, trophies | Token exchange via Supabase Edge Function, then direct API calls from iOS with the access token. |
| **IsThereAnyDeal** | Deal prices | Direct call from iOS. |
| **Sentry** | Error tracking | New iOS project in existing `inventory-full` Sentry org. |

### Development tools & why

| Tool | Purpose | Why / how we use it |
|---|---|---|
| **Xcode 16+** | IDE, build, run, test, sign, submit | Required. No way around it for native iOS. |
| **Fastlane** | Automate builds, TestFlight uploads, screenshots, signing, App Store submission | Reduces manual Xcode clicking. Install via `gem install fastlane` (Homebrew is broken on macOS 26). Key lanes: `fastlane beta` (build + TestFlight), `fastlane release` (build + App Store), `fastlane screenshots`. |
| **Swift Package Manager** | Dependency management | Built into Xcode. Preferred over CocoaPods — no separate install, no Podfile, no `pod install` step. All deps added via Xcode's package resolution. |
| **`xcrun simctl`** | iOS Simulator management from CLI | Launch simulators, install builds, take screenshots without Xcode GUI. |
| **`xcodebuild`** | CLI builds and tests | Fastlane wraps this, but available directly for CI or scripting. |

### MCPs (Claude Code integrations)

These are the MCPs already connected that help during iOS development:

| MCP | How it helps iOS work |
|---|---|
| **Supabase** (`mcp__ed35801a`) | Deploy Edge Functions (PSN token exchange, share API), manage database tables, run migrations. Critical for the server-side pieces the iOS app depends on. I can deploy and test Edge Functions directly without Brady leaving the terminal. |
| **Sentry** (`mcp__31f8fda1`) | Monitor errors, search issues, check event details for the iOS app's Sentry project. Same org as web (`inventory-full`), new project for iOS. |
| **Context7** (`mcp__3208bc0d`) | Query Apple developer documentation (SwiftUI, WidgetKit, App Intents, AuthenticationServices) inline. Useful for API reference during Swift code generation. |
| **Mac control / osascript** (`mcp__Control_your_Mac__osascript`) | Potentially trigger Xcode builds, launch simulator, run `xcodebuild` commands via AppleScript. Reduces need for Brady to manually interact with Xcode during iterative development. |
| **Playwright** (`mcp__playwright`) | Test the Supabase Edge Function endpoints that iOS calls. Not for iOS UI testing, but useful for backend verification. |

MCPs NOT available that we'd want (none exist in the registry):
- Vercel MCP — not needed; iOS doesn't deploy to Vercel
- GitHub MCP — would help with the new repo, but `git` CLI covers it
- App Store Connect MCP — doesn't exist; TestFlight/review management is manual
- Xcode MCP — doesn't exist; use Fastlane + osascript instead

### What Brady needs to set up before build starts

- [ ] **Apple Developer Program enrollment** — $99/year, required for code signing and TestFlight
- [ ] **Install Xcode 16+** from the App Store (if not already)
- [ ] **Install Fastlane** — `gem install fastlane` (not Homebrew — Homebrew is broken on macOS 26.4)
- [ ] **Create the `inventoryfull-ios` GitHub repo** — private repo, Brady as owner
- [ ] **Create iOS project in Sentry** — in the existing `inventory-full` org
- [ ] **Enroll in App Store Small Business Program** — drops Apple's cut from 30% to 15% (applies if annual earnings < $1M)
- [ ] **Confirm bundle ID** — `gg.inventoryfull.app` (recommended) or `com.slant.inventoryfull`
- [ ] **Confirm iOS 17.0+ deployment target** — recommended, gives access to all modern APIs

---

## Screen-by-screen translation map

The web app has 17 pages and 43 components. The iOS app needs a subset — marketing/SEO pages stay web-only.

### Screens the iOS app NEEDS

| iOS Screen | Web source | SwiftUI approach | Phase |
|---|---|---|---|
| **Library** (main view) | `app/page.tsx` + `TabNav.tsx` + `GameCard.tsx` + `GridCard.tsx` | `TabView` with 5 status tabs (Backlog, Up Next, Playing Now, Completed, Moved On). `LazyVGrid` for grid, `List` for list view. `Searchable` modifier for filtering. | 0 |
| **Picker / Reroll** | `Reroll.tsx` | Sheet or full-screen cover. Two-step flow: mood selection → session length → result with cover art + "Let's Go" button. Dice roll animation via SwiftUI `.transition` + haptics. | 0 |
| **Game Detail** | `GameDetailModal.tsx` + `GameCard.tsx` | `.sheet` presentation. Game cover, metadata (HLTB, genres, Metacritic), status cycle buttons, notes, achievements. | 0 |
| **Import Hub** | `ImportHub.tsx` + platform modals | `NavigationStack` with platform list. Each platform has its own import flow view. Steam first (Phase 0), PSN/Xbox (Phase 1), manual add (Phase 0). | 0 |
| **Settings** | `SettingsMenu.tsx` | SwiftUI `Form` with sections: theme picker, view mode, platform preference, linked accounts, about/legal links. | 0 |
| **Onboarding** | `GetStartedModal.tsx` + `HelpModal.tsx` | `TabView` with `.tabViewStyle(.page)` — 3-4 swipeable screens explaining the app, ending on import CTA. First-run only. | 0 |
| **Stats** | `StatsPanel.tsx` + `StatCard.tsx` | Grid of stat cards. Completion rate, hours played, platform breakdown, genre diversity. | 1 |
| **Completion Celebration** | `CompletionCelebration.tsx` | Full-screen overlay with confetti animation, milestone copy, archetype reveal if applicable. Haptic feedback. | 1 |
| **Archetype Profile** | `ArchetypeCard.tsx` + `app/archetype/[slug]/page.tsx` | Detail view showing player archetype with sprite, description, stats breakdown. | 1 |
| **Share Composer** | `StatsShareComposer.tsx` | Generate shareable image of stats/archetype. Use `ImageRenderer` (iOS 16+) for SwiftUI → image. Share via `ShareLink`. | 1 |

### Screens that stay WEB-ONLY

These are marketing, SEO, or web-specific. The iOS app links to them via `SFSafariViewController` if needed.

- Landing page (`LandingPageV2.tsx`) — App Store listing replaces this
- Blog posts (backlog strategy, decision paralysis, why deciding is hard) — SEO content
- Platform-specific landing pages (Steam/PSN/Xbox picker pages) — SEO content
- Alternatives comparison page — SEO content
- Privacy policy / Terms of service — link to inventoryfull.gg/privacy and /terms
- Unsubscribe — web email flow
- Cookie banner — not needed on iOS
- About page — condensed into Settings > About section

### Component translation notes

| Web component | iOS equivalent | Notes |
|---|---|---|
| `GameCard.tsx` (~1000 lines) | Split into `GameCardView`, `GameCardActions`, `GameStatusPill` | The web component is monolithic. On iOS, decompose into focused SwiftUI views. |
| `Reroll.tsx` | `PickerView` + `PickerResultView` | Two-screen flow instead of single modal. |
| `TabNav.tsx` (5 status tabs) | SwiftUI `TabView` or segmented control | Status tabs are the primary navigation. |
| `ThemeClass.tsx` (11 themes) | `ThemeManager` ObservableObject + SwiftUI environment | Phase 0: light + dark only. Phase 1: port remaining 9 themes. CSS custom properties → Swift `Color` definitions. |
| `Toast.tsx` | SwiftUI `.alert` or custom overlay | Keep it simple. |
| Confetti animation | SwiftUI `Canvas` + particle system | Or use CAEmitterLayer via UIViewRepresentable. |

---

## Data model translation

### Core types (TypeScript → Swift)

```
Web: Game interface (lib/types.ts)
iOS: @Model class Game (SwiftData)

Key fields:
  id: UUID
  name: String
  source: GameSource (enum: steam, playstation, xbox, epic, switch, gog, other)
  steamAppId: String?
  xboxTitleId: String?
  psnProductId: String?
  rawgSlug: String?
  coverUrl: URL?
  metacritic: Int?
  genres: [String]
  hoursPlayed: Double
  timeTier: TimeTier (enum: quickHit, windDown, deepCut, marathon)
  vibes: [String]
  status: GameStatus (enum: buried, onDeck, playing, played, bailed)
  moodTags: [MoodTag] (enum: chill, intense, storyRich, brainless, atmospheric,
                         competitive, spooky, creative, strategic, emotional)
  hltbMain: Double?
  hltbComplete: Double?
  achievements: Achievements? (struct: earned, total, gamerscore?, hasPlatinum?)
  rating: Int? (1-5)
  completedAt: Date?
  addedAt: Date
  updatedAt: Date
  isWishlisted: Bool
  isNonFinishable: Bool
  ignored: Bool
  notes: String?
  description: String?
  releaseYear: Int?
```

### State management

Web uses Zustand (single store, action-based). On iOS:

- **`@Observable` classes** for view models (Swift 5.9+ macro, replaces ObservableObject)
- **SwiftData `@Model`** for persisted game data
- **`@AppStorage`** for simple settings (theme, view mode, platform preference)
- **Keychain wrapper** for OAuth tokens

No single monolithic store. SwiftUI's native state management (environment, bindings, observable) replaces Zustand's centralized approach. Key view models:

| View model | Responsibility | Web equivalent |
|---|---|---|
| `LibraryViewModel` | Game CRUD, filtering, sorting, search | `store.ts` game actions + filter state |
| `PickerViewModel` | Reroll logic, mood/session filtering, skip tracking | `reroll.ts` + store reroll state |
| `ImportViewModel` | Platform auth, library fetch, dedup, enrichment | Import modals + `enrichment.ts` |
| `StatsViewModel` | Compute aggregate stats, archetype matching | `archetypes.ts` + `StatsPanel` logic |
| `SettingsViewModel` | Theme, preferences, linked accounts | `store.ts` settings slice |

### Logic modules (direct translation)

These TypeScript modules translate to Swift almost mechanically:

| Web module | iOS equivalent | Translation complexity |
|---|---|---|
| `lib/reroll.ts` | `Services/PickerEngine.swift` | Medium — filter logic + skip tracking. Core algorithm is the same. |
| `lib/enrichment.ts` | `Services/EnrichmentService.swift` | Low — genre→mood map, HLTB→timeTier inference. Data mapping only. |
| `lib/archetypes.ts` | `Services/ArchetypeEngine.swift` | Medium — stat computation + archetype matching. 36 archetypes with descriptions. |
| `lib/types.ts` | `Models/` directory | Low — struct/enum definitions. |

---

## API layer

### Direct API calls from iOS (no server needed)

| API | Swift implementation | Notes |
|---|---|---|
| **Steam** | URLSession → Steam Web API | Public API key. Library + playtime. OAuth via `SFSafariViewController` → callback URL. |
| **RAWG** | URLSession → api.rawg.io | API key in app bundle (read-only, not sensitive). Game search, metadata, covers. |
| **HLTB** | URLSession → howlongtobeat.com | Same approach as web's direct API call. Completion time estimates. |
| **OpenXBL** | URLSession → xbl.io | API key in app bundle. Xbox library, achievements, gamerscore. |
| **IsThereAnyDeal** | URLSession → itad.api | Deal prices. Direct call. |

### Supabase Edge Functions (server-side required)

| Function | Why it needs a server |
|---|---|
| **PSN token exchange** | PSN OAuth client secret cannot live in the app bundle. The Edge Function holds the secret, receives the auth code from the iOS app, exchanges it for access/refresh tokens, and returns them. Tokens then stored in Keychain on-device. |
| **PSN token refresh** | Same reason — refresh token exchange requires the client secret. |
| **Share snapshot save/load** | Shared library snapshots are stored in Supabase. iOS app calls the Edge Function to save/retrieve. Already exists for web. |
| **Feedback ingest** | Rate-limited feedback storage. Already exists for web. |

These Edge Functions are deployed via the Supabase MCP. They serve both web and iOS — no duplication.

### API key security

- **Steam API key, RAWG key, OpenXBL key:** Bundled in app. These are read-only, rate-limited keys. Standard practice for mobile apps. Not sensitive enough to warrant server-side proxying.
- **PSN client secret:** NEVER in the app bundle. Lives only in the Supabase Edge Function environment.
- **Supabase anon key:** Bundled in app (same as web — intentionally public, RLS gates everything).

---

## Xcode project structure

```
inventoryfull-ios/
├── InventoryFull/                          # Main app target
│   ├── InventoryFullApp.swift              # @main entry point
│   ├── Models/
│   │   ├── Game.swift                      # @Model (SwiftData)
│   │   ├── GameStatus.swift                # Enum: buried, onDeck, playing, played, bailed
│   │   ├── MoodTag.swift                   # Enum: 10 mood descriptors
│   │   ├── TimeTier.swift                  # Enum: quickHit, windDown, deepCut, marathon
│   │   ├── GameSource.swift                # Enum: steam, playstation, xbox, etc.
│   │   ├── Archetype.swift                 # Archetype definitions (36 types)
│   │   └── PlayerStats.swift               # Computed stats struct
│   ├── Views/
│   │   ├── Library/
│   │   │   ├── LibraryView.swift           # Main tab view with status tabs
│   │   │   ├── GameCardView.swift          # Individual game card
│   │   │   ├── GameGridView.swift          # Grid layout
│   │   │   └── GameListView.swift          # List layout
│   │   ├── Picker/
│   │   │   ├── PickerView.swift            # Mood + session length selection
│   │   │   └── PickerResultView.swift      # Result with cover + "Let's Go"
│   │   ├── GameDetail/
│   │   │   └── GameDetailView.swift        # Full game info sheet
│   │   ├── Import/
│   │   │   ├── ImportHubView.swift          # Platform selection
│   │   │   ├── SteamImportView.swift        # Steam OAuth + library fetch
│   │   │   ├── PSNImportView.swift          # PSN OAuth flow
│   │   │   ├── XboxImportView.swift         # Xbox import flow
│   │   │   └── ManualAddView.swift          # Manual game search + add
│   │   ├── Settings/
│   │   │   └── SettingsView.swift           # Preferences, linked accounts, about
│   │   ├── Stats/
│   │   │   ├── StatsView.swift              # Dashboard
│   │   │   └── ArchetypeView.swift          # Player archetype detail
│   │   ├── Onboarding/
│   │   │   └── OnboardingView.swift         # First-run paged walkthrough
│   │   ├── Celebration/
│   │   │   └── CelebrationView.swift        # Completion confetti + milestone
│   │   └── Components/
│   │       ├── StatusPill.swift             # Status badge
│   │       ├── CoverImage.swift             # Async image loader with placeholder
│   │       ├── DiceRollAnimation.swift      # Picker animation
│   │       └── ConfettiView.swift           # Particle animation
│   ├── ViewModels/
│   │   ├── LibraryViewModel.swift
│   │   ├── PickerViewModel.swift
│   │   ├── ImportViewModel.swift
│   │   ├── StatsViewModel.swift
│   │   └── SettingsViewModel.swift
│   ├── Services/
│   │   ├── PickerEngine.swift               # Reroll logic (from lib/reroll.ts)
│   │   ├── EnrichmentService.swift          # Genre→mood, HLTB→timeTier (from lib/enrichment.ts)
│   │   ├── ArchetypeEngine.swift            # Stats + archetype matching (from lib/archetypes.ts)
│   │   ├── SteamAPI.swift                   # Steam Web API client
│   │   ├── PSNAPI.swift                     # PSN API client (tokens via Edge Function)
│   │   ├── XboxAPI.swift                    # OpenXBL API client
│   │   ├── RAWGAPI.swift                    # RAWG metadata client
│   │   ├── HLTBAPI.swift                    # HLTB time estimates client
│   │   ├── DealsAPI.swift                   # IsThereAnyDeal client
│   │   ├── SupabaseService.swift            # Edge Function calls (PSN auth, share, feedback)
│   │   ├── KeychainService.swift            # Secure token storage
│   │   └── AnalyticsService.swift           # GA4/Firebase event tracking
│   ├── Theme/
│   │   ├── ThemeManager.swift               # @Observable theme state
│   │   ├── Theme.swift                      # Theme protocol + definitions
│   │   └── Themes/                          # Individual theme color sets
│   └── Resources/
│       ├── Assets.xcassets                  # App icon, brand assets, covers
│       ├── Sprites/                         # Archetype pixel sprites (from public/sprites/h2/)
│       └── Brand/                           # Wordmark SVG, logomark
├── InventoryFullWidget/                     # Widget Extension target
│   ├── TodaysPickWidget.swift               # Home screen widget (medium + large)
│   ├── LockScreenWidget.swift               # Lock screen widget (circular + rectangular)
│   ├── WidgetDataProvider.swift             # Timeline provider, reads App Group
│   └── Assets.xcassets
├── InventoryFullShare/                      # Share Extension target
│   ├── ShareViewController.swift            # URL parser for Steam/Metacritic/IGDB
│   └── Info.plist
├── InventoryFullIntents/                    # App Intents target
│   └── WhatShouldIPlayIntent.swift          # "What should I play?" Siri shortcut
├── Shared/                                  # Code shared across all targets
│   ├── AppGroupConstants.swift              # App Group container ID
│   ├── TodaysPickAlgorithm.swift            # Deterministic daily pick (shared with widget)
│   └── SharedModels.swift                   # Lightweight models the widget/extension need
├── fastlane/
│   ├── Fastfile                             # Build lanes: beta, release, screenshots
│   ├── Appfile                              # Bundle ID, Apple ID, team ID
│   └── Matchfile                            # Code signing config
├── .gitignore
└── README.md                                # Links to web repo for specs + decisions
```

---

## Phase 0 — Core App on TestFlight (2-3 weeks build + 2 weeks data)

### Goal

Native SwiftUI app with the core loop running on real iOS devices via TestFlight. Validates whether native + widget changes user behavior vs. the web app. This is NOT a wrapped website — it's a real app from day one.

### What's in Phase 0

The minimum set to test the hypothesis "native iOS app with a widget changes how people interact with their backlog":

1. **Library view** — game grid/list with status tabs, search, filtering
2. **Picker** — mood + session length → single game pick with dice animation
3. **Game detail** — sheet with metadata, status cycle, notes
4. **Steam import** — OAuth → library fetch → enrichment (Steam is simplest, tests the full import pipeline)
5. **Manual game add** — search RAWG, add to library (for non-Steam testers)
6. **Settings** — light/dark theme, view mode toggle, basic preferences
7. **Onboarding** — first-run walkthrough ending on import CTA
8. **Today's Pick widget** — home screen widget showing daily recommendation (THIS IS THE KEY TEST)
9. **Basic theming** — light + dark mode only (remaining themes in Phase 1)

### What's NOT in Phase 0

- PSN/Xbox OAuth (complex, not needed for validation)
- Share extension + Siri shortcut (Phase 1 features for App Store guideline compliance)
- Completion celebration + archetypes (delight features, Phase 1)
- Stats dashboard (Phase 1)
- Remaining 9 themes beyond light/dark (Phase 1)
- Haptic feedback polish (Phase 1)
- Full offline support (Phase 1)
- StoreKit / IAP (Phase 2)

### Pre-flight checklist

- [ ] Apple Developer Program enrolled, team ID available
- [ ] Xcode 16+ installed
- [ ] Fastlane installed (`gem install fastlane`)
- [ ] `inventoryfull-ios` GitHub repo created (private)
- [ ] Bundle ID confirmed with Brady
- [ ] iOS Sentry project created in `inventory-full` org
- [ ] PSN token exchange Edge Function deployed to Supabase (needed for Phase 1 but good to have early)
- [ ] Brand assets exported for iOS: app icon (1024x1024), wordmark SVG, archetype sprites

### Phase 0 task list

#### Project setup
- [ ] Create Xcode project: "InventoryFull", bundle ID per Brady's confirmation, iOS 17.0+
- [ ] Add Widget Extension target ("InventoryFullWidget")
- [ ] Configure App Group container (shared between app + widget)
- [ ] Set up Fastlane: `Fastfile` with `beta` lane, `Appfile` with credentials
- [ ] Add sentry-cocoa via Swift Package Manager
- [ ] Initialize git, push to `inventoryfull-ios` repo
- [ ] Configure automatic code signing with Apple Developer team

#### Data layer
- [ ] Define SwiftData `@Model` for `Game` (translate from `lib/types.ts`)
- [ ] Define enums: `GameStatus`, `MoodTag`, `TimeTier`, `GameSource`
- [ ] Set up SwiftData `ModelContainer` in app entry point
- [ ] Implement `@AppStorage` for settings (theme, viewMode, platformPreference)
- [ ] Implement Keychain wrapper for OAuth tokens
- [ ] Implement App Group data writing for widget

#### Core UI
- [ ] `LibraryView` — TabView with 5 status tabs, game count badges
- [ ] `GameCardView` — cover image, name, platform icon, status pill, hours played
- [ ] `GameGridView` — LazyVGrid layout with adaptive columns
- [ ] `GameListView` — List layout alternative
- [ ] View toggle (grid/list) persisted in `@AppStorage`
- [ ] Search bar via `.searchable` modifier
- [ ] Filter sheet (mood tags, platform, time tier)

#### Picker
- [ ] `PickerView` — mood tag selection (10 options) + session length (4 tiers)
- [ ] `PickerResultView` — game cover art, name, "why this" reason, "Let's Go" CTA, reroll button
- [ ] Translate `lib/reroll.ts` → `PickerEngine.swift` (eligible game filtering, skip tracking, cooldown)
- [ ] Dice roll animation (SwiftUI `.rotation3DEffect` + `.transition`)

#### Game detail
- [ ] `GameDetailView` — sheet with cover, description, genres, HLTB times, Metacritic score
- [ ] Status cycle buttons (matches web's 5-state cycle)
- [ ] Notes field (TextEditor)
- [ ] Achievement display (if available)

#### Import
- [ ] `ImportHubView` — platform list with connection status
- [ ] `SteamImportView` — SteamID input → API fetch → library hydration
- [ ] `ManualAddView` — RAWG search → select → add to library
- [ ] `EnrichmentService.swift` — translate `lib/enrichment.ts` (genre→mood, HLTB→timeTier, detectNonFinishable)
- [ ] Post-import dedup logic (match by name similarity across sources)
- [ ] Basic progress indicator during import

#### Widget
- [ ] `TodaysPickWidget` — medium + large home screen sizes
- [ ] `WidgetDataProvider` — TimelineProvider, daily refresh at midnight local
- [ ] `TodaysPickAlgorithm` — deterministic from date + library hash (shared with main app in `Shared/`)
- [ ] Game cover image in widget (downloaded + cached in App Group)
- [ ] Deep link from widget tap → app opens to game detail

#### Settings
- [ ] `SettingsView` — Form with sections
- [ ] Theme toggle: light / dark (system default)
- [ ] View mode: grid / list
- [ ] Platform preference: any / PC / console
- [ ] Linked accounts section (shows Steam connection status)
- [ ] About section: version, link to inventoryfull.gg/privacy, link to inventoryfull.gg/terms
- [ ] Export/import library (JSON, matches web format for cross-platform portability)

#### Onboarding
- [ ] `OnboardingView` — 3-4 page TabView with page indicators
- [ ] Pages: what this app does → how it works → import your library → let's go
- [ ] First-run detection via `@AppStorage("hasCompletedOnboarding")`
- [ ] Skip button on every page

#### TestFlight
- [ ] Configure App Store Connect listing (placeholder copy — **Brady writes final copy**)
- [ ] App icon + launch screen
- [ ] Internal TestFlight build (verify on real device)
- [ ] External TestFlight (30-50 Discord testers)
- [ ] Tester recruitment message for Discord — **Brady writes and posts**
- [ ] Set up retention tracking: define cohort, measure against `picker_selection` event

### Phase 0 success criteria

- [ ] App runs on real iOS devices via TestFlight
- [ ] 30+ external testers installed and using
- [ ] Core loop works: import → browse → pick → play
- [ ] Widget shows Today's Pick on home screen
- [ ] 2 weeks of usage data collected

### Phase 0 kill criteria

- Week-2 retention below 20% on the TestFlight cohort (measured against `picker_selection` event firing)
- Widget adoption below 30% of active testers (if nobody uses the widget, the main differentiator fails)

If kill criteria hit → stay web-only, revisit iOS later.

---

## Phase 1 — Native Features + App Store (4-5 weeks after Phase 0 success)

### Goal

Add the iOS-native features that clear Apple Guideline 4.2, complete the feature set, and polish for public App Store release.

### Phase 1 task list

#### PSN OAuth
- [ ] Deploy PSN token exchange Edge Function to Supabase (client secret stays server-side)
- [ ] `PSNImportView` — "Connect PlayStation" button
- [ ] `ASWebAuthenticationSession` flow: authorize URL → isolated browser → callback with auth code
- [ ] Exchange auth code for access/refresh tokens via Edge Function
- [ ] Store tokens in Keychain
- [ ] Fetch PSN library using access token
- [ ] Implement refresh token logic: silent at app launch, prompt re-auth on failure
- [ ] Test: complete fresh PSN onboarding in under 30 seconds

#### Xbox OAuth
- [ ] `XboxImportView` — "Connect Xbox" button
- [ ] `ASWebAuthenticationSession` flow via OpenXBL
- [ ] Store tokens in Keychain
- [ ] Fetch Xbox library, achievements, gamerscore
- [ ] Test: complete fresh Xbox onboarding in under 30 seconds

#### Siri Shortcut
- [ ] `WhatShouldIPlayIntent` — App Intent returning Today's Pick
- [ ] Response includes game name + one-line reason
- [ ] Works via Siri voice, Shortcuts app, and Spotlight
- [ ] Reads from same App Group data as widget

#### Share Extension
- [ ] Add Share Extension target ("InventoryFullShare")
- [ ] URL parser for: Steam store, Metacritic, IGDB, generic pages with OG metadata
- [ ] Parse game name → RAWG search → confirmation → add to library via App Group
- [ ] Test from Safari, Reddit app, common share sources

#### Stats + Archetypes
- [ ] `StatsView` — dashboard with stat cards (completion rate, hours, platform breakdown, genre diversity)
- [ ] Translate `lib/archetypes.ts` → `ArchetypeEngine.swift` (36 archetypes, stat computation, matching)
- [ ] `ArchetypeView` — archetype detail with sprite image, description, personality traits
- [ ] Bundle archetype sprites from `public/sprites/h2/` into iOS asset catalog
- [ ] Share composer: generate shareable stats image via `ImageRenderer`

#### Completion celebration
- [ ] `CelebrationView` — full-screen overlay on game completion
- [ ] Confetti particle animation (SwiftUI Canvas or CAEmitterLayer)
- [ ] Milestone copy from web's `CompletionCelebration.tsx` (translate, then voice-sweep)
- [ ] Archetype reveal if completion triggers a new archetype match
- [ ] Haptic feedback (`.impact(.heavy)` on confetti drop)

#### Themes
- [ ] Port remaining 9 themes from web (90s, 80s, dino, weird, ultra, void, minimal, tropical, campfire)
- [ ] `ThemeManager` — `@Observable` class with current theme, provides `Color` values
- [ ] Each theme as a struct conforming to `Theme` protocol
- [ ] Translate CSS custom properties from `app/globals.css` → Swift Color definitions
- [ ] Theme picker in Settings with live preview

#### Polish
- [ ] Safe area handling (notch, Dynamic Island, home indicator) — test on multiple device sizes
- [ ] Haptic feedback on key actions: dice roll, "Let's Go" tap, status change, completion
- [ ] Pull-to-refresh on library (triggers re-enrichment of stale data)
- [ ] Loading states for OAuth flows and imports (ProgressView + descriptive text)
- [ ] Offline behavior: library works fully offline, import/enrichment require network with clear messaging
- [ ] Empty states: no games yet, no games in this status, no search results
- [ ] Error handling: network failures, API rate limits, malformed data — user-friendly messaging
- [ ] Accessibility: VoiceOver labels, Dynamic Type support, sufficient contrast (WCAG AA)
- [ ] Lock screen widget (circular + rectangular variants)
- [ ] App icon finalized with brand assets

#### App Store submission

> **App Store listing copy is Brady's call.** Do not write description, subtitle, promotional text, or "What's New" notes autonomously. Prepare placeholders, flag to Brady.

- [ ] Privacy policy update at inventoryfull.gg/privacy reflecting iOS-specific data flows
- [ ] App Store listing copy — **Brady writes/approves**
- [ ] Screenshots from real device: library, picker result, widget, game detail, import
- [ ] App Preview video (optional — dice roll → pick → "Let's Go" sequence is visually strong)
- [ ] App Privacy questionnaire in App Store Connect:
  - Data collected: game library data (linked to user's device, not identity)
  - Data NOT collected: name, email, location, contacts, browsing, purchases
  - No tracking, no third-party data sharing
- [ ] Submit for review
- [ ] Review notes highlighting native features: WidgetKit widget, Siri Shortcut, Share Extension, ASWebAuthenticationSession OAuth — all demonstrable
- [ ] **Expect 1-2 review cycles.** Apple 4.2 rejections happen even with native features for new developer accounts. Have demo instructions ready.

### Phase 1 success criteria

- [ ] Free tier live on public App Store
- [ ] One-tap PSN/Xbox/Steam onboarding
- [ ] Today's Pick widget on real users' home screens
- [ ] Siri Shortcut + Share Extension working
- [ ] Reviews stable at 4+ stars
- [ ] Install → first picker_selection < 60 seconds
- [ ] OAuth completion rate > 80% per platform
- [ ] Widget adoption > 50% of weekly active users
- [ ] App Store Connect analytics + GA4 (if added) measuring retention: day 1/7/14/30

---

## Phase 2 (out of scope — documented for context)

Separate brief. Premium features unlocked via $9.99 one-time IAP:

- **Intelligence layer** — smart recommendations that learn from play patterns
- **Cloud sync** — Supabase account system, cross-device library sync
- **Year-in-Backlog** — annual recap (like Spotify Wrapped for your game library)
- **Comfort/exploration tagging** — classify games by familiarity vs. novelty
- **Sign in with Apple** — account creation for cloud sync
- **Tip jar** — $2.99 / $6.99 / $14.99 consumable IAPs, post-milestone surfacing
- **Pip personalization** — if the Discord bot character extends to iOS

## Phase 3 (out of scope)

- **Apple Watch** — Today's Pick complication on the wrist. Logical extreme of the "zero time in app" thesis — glance, see the game, go play. Same App Group data and TodaysPickAlgorithm already built for the iPhone widget. Minimal new code (small SwiftUI view + WidgetKit complication). Pursue if iPhone widget adoption is strong post-launch.
- **Android** — Kotlin/Jetpack Compose rewrite following the same translation approach

---

## Open questions (raise to Brady when they come up)

1. **Bundle ID:** `gg.inventoryfull.app` (recommended) or `com.slant.inventoryfull`?
2. **iOS 17.0+ deployment target:** confirmed OK? (Recommended — gives modern WidgetKit, SwiftData, App Intents.)
3. **Today's Pick algorithm:** simple deterministic random for Phase 0, or translate the mood-default picker logic? Recommend simple deterministic — the learning model is Phase 2.
4. **GA4 on iOS:** add Firebase Analytics SDK in Phase 0 for event tracking, or rely on App Store Connect analytics alone? (Recommend adding Firebase in Phase 0 — need `picker_selection` event for retention measurement.)
5. **Game Pass / PS+ browse:** include in Phase 1, or defer? Web has these but they're catalog-browse features, not core loop.
6. **Cross-platform library portability:** the Settings > Export/Import JSON matches web format. Should we actively promote "export from web, import on iOS" as an onboarding path?
7. **npsso paste fallback on iOS:** keep as PSN fallback if OAuth fails for some users? (Probably no — but surface if beta testers report OAuth failure.)

---

## Reference links

- PSN GO security page (OAuth reference): https://psngo.app/#security
- psn-api docs: https://psn-api.achievements.app/
- OpenXBL (Xbox API): https://xbl.io/
- WidgetKit docs: https://developer.apple.com/documentation/widgetkit
- App Intents (Siri): https://developer.apple.com/documentation/appintents
- ASWebAuthenticationSession: https://developer.apple.com/documentation/authenticationservices/aswebauthenticationsession
- SwiftData docs: https://developer.apple.com/documentation/swiftdata
- StoreKit 2: https://developer.apple.com/documentation/storekit
- Apple Guideline 4.2: https://developer.apple.com/app-store/review/guidelines/#minimum-functionality
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/

---

*v1.0 — 2026-05-20. Full rewrite from Capacitor brief to native SwiftUI. All locked decisions documented with reasoning.*
