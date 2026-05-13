/**
 * Slash-command registration. Run once after adding/changing commands.
 *
 *   npm run register            # guild-only (instant) if DISCORD_DEV_GUILD_ID set
 *   npm run register:prod       # global (1-hour propagation)
 *
 * Discord caches command definitions; the bot at runtime only reads
 * incoming interactions, it doesn't re-register every boot.
 */
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { data as pickData } from './commands/pick.js';
import { data as archetypeData } from './commands/archetype.js';

const TOKEN = required('DISCORD_TOKEN');
const APP_ID = required('DISCORD_APP_ID');
const DEV_GUILD_ID = process.env.DISCORD_DEV_GUILD_ID;
const isProd = process.env.NODE_ENV === 'production';

const commands = [pickData.toJSON(), archetypeData.toJSON()];

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function main() {
  if (DEV_GUILD_ID && !isProd) {
    console.log(`[register] guild scope (instant): ${DEV_GUILD_ID}`);
    await rest.put(Routes.applicationGuildCommands(APP_ID, DEV_GUILD_ID), { body: commands });
  } else {
    console.log('[register] global scope (1-hour propagation)');
    await rest.put(Routes.applicationCommands(APP_ID), { body: commands });
  }
  console.log(`[register] registered ${commands.length} commands.`);
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var: ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return v;
}

main().catch((err) => {
  console.error('[register] failed:', err);
  process.exit(1);
});
