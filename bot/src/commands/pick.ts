/**
 * /pick — single-game recommendation from a curated pool.
 *
 * Stateless. No DB. No cooldown (deferred — spec calls for 24h cooldown but
 * the MVP ships without it; we'll add Redis or Fly KV later if abuse shows).
 *
 * Voice: confident, no hedging. The reveal reads "Here's your game." not
 * "You might like...". Matches .claude/rules/voice-charter.md.
 */
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandedEmbed, noMatchLine, pickHeader } from '../embed.js';

type LengthTier = 'small' | 'medium' | 'large';

interface PoolEntry {
  title: string;
  lengthHours: number;
  moods: string[];
  blurb: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/ at runtime; data/ sits beside src/ and dist/, so go up one.
const POOL_PATH = join(__dirname, '..', '..', 'data', 'pick-pool.json');
const POOL: PoolEntry[] = JSON.parse(readFileSync(POOL_PATH, 'utf-8'));

const MOOD_CHOICES = [
  { name: 'Chill', value: 'chill' },
  { name: 'Intense', value: 'intense' },
  { name: 'Story Rich', value: 'story-rich' },
  { name: 'Brain Off', value: 'brain-off' },
  { name: 'Atmospheric', value: 'atmospheric' },
  { name: 'Strategic', value: 'strategic' },
  { name: 'Creative', value: 'creative' },
  { name: 'Spooky', value: 'spooky' },
  { name: 'Emotional', value: 'emotional' },
];

function matchesLength(entry: PoolEntry, length?: LengthTier): boolean {
  if (!length) return true;
  if (length === 'small') return entry.lengthHours <= 10;
  if (length === 'medium') return entry.lengthHours > 10 && entry.lengthHours <= 30;
  return entry.lengthHours > 30;
}

function matchesMood(entry: PoolEntry, mood?: string): boolean {
  if (!mood) return true;
  return entry.moods.includes(mood);
}

function pickOne(length?: LengthTier, mood?: string): PoolEntry | null {
  const filtered = POOL.filter((e) => matchesLength(e, length) && matchesMood(e, mood));
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export const data = new SlashCommandBuilder()
  .setName('pick')
  .setDescription('Pick one game from a curated pool. We pick, you play.')
  .addStringOption((opt) =>
    opt
      .setName('length')
      .setDescription('How long do you have?')
      .addChoices(
        { name: 'Small (~20 min – a couple hours)', value: 'small' },
        { name: 'Medium (1–2 evenings)', value: 'medium' },
        { name: "Large (I'm in, days)", value: 'large' },
      ),
  )
  .addStringOption((opt) =>
    opt.setName('mood').setDescription('Vibe filter').addChoices(...MOOD_CHOICES),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const length = interaction.options.getString('length') as LengthTier | null;
  const mood = interaction.options.getString('mood');
  const seed = Number(interaction.id) || Date.now();

  const pick = pickOne(length ?? undefined, mood ?? undefined);

  if (!pick) {
    await interaction.reply({ content: noMatchLine(seed), ephemeral: true });
    return;
  }

  const filterLine = [
    length ? `**${capitalize(length)} session**` : null,
    mood ? `**${formatMood(mood)}**` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const embed = brandedEmbed()
    .setTitle(`🎲 ${pickHeader(seed)}`)
    .setDescription(
      `## ${pick.title}\n` +
        `~${pick.lengthHours}h · ${pick.moods.map(formatMood).join(', ')}\n\n` +
        `${pick.blurb}` +
        (filterLine ? `\n\n_${filterLine}_` : ''),
    );

  const rerollButton = new ButtonBuilder()
    .setCustomId(`pick:reroll:${length ?? ''}:${mood ?? ''}`)
    .setLabel('🎲 Roll again')
    .setStyle(ButtonStyle.Secondary);

  const playButton = new ButtonBuilder()
    .setLabel('get playing.')
    .setStyle(ButtonStyle.Link)
    .setURL('https://inventoryfull.gg');

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(rerollButton, playButton);

  await interaction.reply({ embeds: [embed], components: [row] });
}

export async function handleRerollButton(interaction: import('discord.js').ButtonInteraction) {
  const [, , length, mood] = interaction.customId.split(':');
  const seed = Number(interaction.id) || Date.now();
  const pick = pickOne((length || undefined) as LengthTier | undefined, mood || undefined);

  if (!pick) {
    await interaction.reply({ content: noMatchLine(seed), ephemeral: true });
    return;
  }

  const embed = brandedEmbed()
    .setTitle(`🎲 ${pickHeader(seed)}`)
    .setDescription(
      `## ${pick.title}\n` +
        `~${pick.lengthHours}h · ${pick.moods.map(formatMood).join(', ')}\n\n` +
        `${pick.blurb}`,
    );

  const rerollButton = new ButtonBuilder()
    .setCustomId(`pick:reroll:${length}:${mood}`)
    .setLabel('🎲 Roll again')
    .setStyle(ButtonStyle.Secondary);
  const playButton = new ButtonBuilder()
    .setLabel('get playing.')
    .setStyle(ButtonStyle.Link)
    .setURL('https://inventoryfull.gg');
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(rerollButton, playButton);

  await interaction.update({ embeds: [embed], components: [row] });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatMood(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
