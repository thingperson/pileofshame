# Platform Integration Research (April 2026)

## Currently Supported
- **Steam** — live (Steam Web API, public profile)
- **Xbox** — live (OpenXBL API, gamertag)
- **PlayStation** — live (psn-api, NPSSO token)
- **Playnite CSV** — live (covers Steam, GOG, Epic, EA, Ubisoft, Battle.net, Nintendo)
- **Steam Wishlist** — live

## Could Integrate (But Shouldn't Yet)

| Platform | API? | Users | Why Not Now |
|---|---|---|---|
| itch.io | Yes (OAuth) | 108M visits/mo | Audience mismatch — indie jam games, not backlog pile |
| RetroArch | Local .lpl files | Unknown | Different mental model — 500 NES ROMs ≠ pile of shame |

## Cannot Integrate (No API Path)

| Platform | Users | Workaround |
|---|---|---|
| Epic Games Store | 78M MAU | Playnite CSV |
| GOG Galaxy | ~15M | Playnite CSV |
| EA App | ~30-50M | Playnite CSV |
| Ubisoft Connect | 34M MAU | Playnite CSV |
| Battle.net | ~35-45M | Playnite CSV (also only ~15 titles) |
| Nintendo Switch | 38M NSO subs | Manual entry only. Zero API. |
| Amazon Luna | ~1-5M | Streaming model, not a library |
| Humble Bundle | 400K subs | Keys redeem on Steam/GOG/Epic |

## Key Takeaway

Playnite CSV is the correct strategic bet for all platforms without APIs. The only enhancement worth considering is supporting Playnite's JSON export format (via playnite-game-data-exporter extension) for richer metadata.

Epic's EOS Ecom API is developer-scoped (verify ownership of YOUR game), not third-party-scoped (enumerate a user's library). No change expected.

Nintendo provides zero path and shows no signs of opening up, even with Switch 2.
