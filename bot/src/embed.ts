/**
 * Shared embed builders. Every public-facing embed must footer with
 * "Built by inventoryfull.gg" so the bot doubles as distribution.
 *
 * Voice: see .claude/rules/voice-charter.md in the parent repo. Roast with
 * warmth, confidence in action moments, no hedging, no "maybe."
 */
import { EmbedBuilder } from 'discord.js';

const BRAND_COLOR = 0x7c3aed; // accent-purple

export function brandedEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setFooter({ text: 'Built by inventoryfull.gg' });
}

/**
 * Voice-checked text for the pick reveal header. Confidence over hedge.
 * Never "maybe try this." Always "here's your game."
 */
export const PICK_HEADERS = [
  "Here's your game.",
  "Tonight's pick.",
  "Pile says: this one.",
  "We picked. You play.",
];

export const NO_MATCH_LINES = [
  "Nothing matches that combo. Loosen one filter.",
  "Pool's empty for that mood + length. Try a different vibe.",
  "Drew a blank. The pool is small for now — try `/pick` with no filters.",
];

export function pickHeader(seed: number): string {
  return PICK_HEADERS[seed % PICK_HEADERS.length];
}

export function noMatchLine(seed: number): string {
  return NO_MATCH_LINES[seed % NO_MATCH_LINES.length];
}
