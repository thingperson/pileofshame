# Pip — Inventory Full Discord bot

Slash-command Discord bot for [inventoryfull.gg](https://inventoryfull.gg). Stateless, single-process, hosted on Fly.io.

**Phase 1 commands (this commit):**
- `/pick [length] [mood]` — single-game pick from a curated 20-game pool, with a Roll-again button.
- `/archetype <which>` — embeds the canonical archetype OG card from the web app. Autocomplete over 40 archetypes.

**Deferred to phase 2:** `/whatshouldweplay` (group voting), clear-celebration webhook.

## First-time setup

### 1. Create the Discord app

1. Visit [discord.com/developers/applications](https://discord.com/developers/applications) → New Application → name it **Pip**.
2. **Bot** tab → Reset Token, copy.
3. **General Information** tab → copy the Application ID.
4. **Bot** tab → leave the privileged intents OFF (we only need Guild slash commands).
5. **OAuth2 → URL Generator** → scopes: `bot`, `applications.commands`. Bot permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`. Copy the install URL — that's how server admins add the bot.

### 2. Local dev

```sh
cd bot
cp .env.example .env
# fill in DISCORD_TOKEN, DISCORD_APP_ID, DISCORD_DEV_GUILD_ID (your test server)
npm install
npm run register   # registers commands to your dev guild (instant)
npm run dev        # boots the bot
```

In your test server, type `/pick`. You should see autocomplete options.

### 3. Production deploy (Fly.io)

```sh
brew install flyctl
fly auth signup   # or fly auth login
cd bot
fly launch --no-deploy   # accept the existing fly.toml
fly secrets set DISCORD_TOKEN=... DISCORD_APP_ID=... SENTRY_DSN=... INVENTORY_FULL_URL=https://inventoryfull.gg
NODE_ENV=production npm run register   # one-time, global commands
fly deploy
fly logs
```

Fly's free tier (shared-cpu-1x, 256MB) is more than enough — the bot only holds a WSS gateway connection and JSON parses interaction payloads.

## Architecture

- **No HTTP server.** Discord gateway is outbound WSS only. No `[http_service]` block in `fly.toml`.
- **No DB.** Pool is a JSON file shipped with the bot. Adding state (cooldowns, opt-in webhooks) is a phase-2 decision, probably Fly KV when we get there.
- **No PSN/Steam/Xbox tokens** ever touch the bot process — see `.claude/rules/legal-compliance.md` in the parent repo.

## Voice

User-facing copy must match `.claude/rules/voice-charter.md`. Pick reveals use confident framing ("Here's your game.") never hedged ("You might like..."). Shared embed builder and copy variants live in `src/embed.ts`.

## Project layout

```
bot/
├── data/pick-pool.json          # curated games for /pick
├── src/
│   ├── index.ts                 # entry point, gateway, dispatcher
│   ├── registerCommands.ts      # one-time slash command registration
│   ├── embed.ts                 # shared embed + voice helpers
│   ├── archetypeSlugs.ts        # mirror of lib/archetypeRegistry.ts
│   └── commands/
│       ├── pick.ts
│       └── archetype.ts
├── fly.toml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Adding a command

1. Drop a new file in `src/commands/`. Export `data` (`SlashCommandBuilder`) and `execute(interaction)`.
2. Import it in `src/index.ts` and add to the `COMMANDS` map.
3. `npm run register` (or `register:prod`).

## Growing the pick pool

`data/pick-pool.json` ships with 20 hand-picked games. Brady's plan is to grow it to ~300 by drafting from RAWG + HLTB and editing. The drafting script will land in a follow-up PR (`scripts/build-pool.ts`) once we know the Phase 1 bot ships and works.

Schema:
```json
{
  "title": "Game Title",
  "lengthHours": 25,
  "moods": ["chill", "story-rich"],
  "blurb": "One short, confident sentence. No hedging."
}
```

Mood vocabulary matches the web app's mood filters: `chill`, `intense`, `story-rich`, `brain-off`, `atmospheric`, `strategic`, `creative`, `spooky`, `emotional`. Don't introduce new ones without updating `MOOD_CHOICES` in `src/commands/pick.ts`.

## What's NOT here yet

- `/whatshouldweplay` (group poll command)
- Clear-celebration webhook (opt-in DM/channel post when a user marks a game Completed in the web app)
- OAuth account linking (Discord ID ↔ IF user)
- Cooldowns / rate limits beyond Discord's built-in
- Tests

Each gets its own PR.
