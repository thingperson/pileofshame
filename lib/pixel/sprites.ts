import personasJson from './data/personas.json';
import { MOOD_SPRITES } from './data/moods';
import { BADGE_SPRITES, SLOT_SPRITES, AMBIENT_SPRITES } from './data/badges';
import { STATUS_SPRITES } from './data/status';
import { TONE_SPRITES } from './data/tone';
import { SKIP_SPRITES } from './data/skip';

export { MOOD_SPRITES, BADGE_SPRITES, SLOT_SPRITES, AMBIENT_SPRITES, STATUS_SPRITES, TONE_SPRITES, SKIP_SPRITES };

export const PERSONA_SPRITES: Record<string, string> = personasJson;

export const ALL_SPRITES: Record<string, string> = {
  ...PERSONA_SPRITES,
  ...MOOD_SPRITES,
  ...BADGE_SPRITES,
  ...SLOT_SPRITES,
  ...AMBIENT_SPRITES,
  ...STATUS_SPRITES,
  ...TONE_SPRITES,
  ...SKIP_SPRITES,
};

export type SpriteCategory = 'persona' | 'mood' | 'badge' | 'slot' | 'ambient' | 'status' | 'tone' | 'skip';

export function hasSprite(name: string): boolean {
  return name in ALL_SPRITES;
}
