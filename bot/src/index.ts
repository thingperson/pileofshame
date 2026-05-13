/**
 * Pip — Inventory Full Discord bot entry point.
 *
 * Stateless. Slash commands only. No MESSAGE_CONTENT intent (privileged).
 *
 * To add a command:
 *   1. Drop a file in src/commands/.
 *   2. Export `data` (SlashCommandBuilder) and `execute`.
 *   3. Add to the COMMANDS map below.
 *   4. Re-run `npm run register`.
 */
import 'dotenv/config';
import * as Sentry from '@sentry/node';
import {
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
} from 'discord.js';
import * as pickCmd from './commands/pick.js';
import * as archetypeCmd from './commands/archetype.js';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV || 'development',
  });
}

const TOKEN = required('DISCORD_TOKEN');

interface Command {
  data: { name: string };
  execute: (interaction: import('discord.js').ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: import('discord.js').AutocompleteInteraction) => Promise<void>;
}

const COMMANDS: Record<string, Command> = {
  pick: pickCmd as unknown as Command,
  archetype: archetypeCmd as unknown as Command,
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (c) => {
  console.log(`[pip] ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = COMMANDS[interaction.commandName];
      if (!cmd) {
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        return;
      }
      await cmd.execute(interaction);
      return;
    }

    if (interaction.isAutocomplete()) {
      const cmd = COMMANDS[interaction.commandName];
      if (cmd?.autocomplete) {
        await cmd.autocomplete(interaction);
      }
      return;
    }

    if (interaction.isButton()) {
      // Button custom IDs are namespaced: `<command>:<action>:...`
      const [namespace] = interaction.customId.split(':');
      if (namespace === 'pick') {
        await pickCmd.handleRerollButton(interaction);
      }
      return;
    }
  } catch (err) {
    console.error('[pip] interaction error:', err);
    Sentry.captureException(err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({ content: "Something broke. We'll fix it.", ephemeral: true });
      } catch {
        // already replied or expired; nothing to do
      }
    }
  }
});

// Graceful shutdown so Fly's stop signal lets the gateway disconnect cleanly.
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    console.log(`[pip] received ${sig}, disconnecting...`);
    client.destroy();
    process.exit(0);
  });
}

client.login(TOKEN).catch((err) => {
  console.error('[pip] login failed:', err);
  Sentry.captureException(err);
  process.exit(1);
});

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var: ${name}.`);
    process.exit(1);
  }
  return v;
}
