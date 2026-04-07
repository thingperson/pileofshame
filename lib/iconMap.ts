// Custom DALL-E icon mapping
// Maps mood tags, statuses, and reroll modes to custom icon paths.
// Falls back to emoji when no custom icon exists.

import { MoodTag } from './types';

export const MOOD_ICONS: Record<MoodTag, string | null> = {
  'chill': '/icons/mood-chill.png',
  'intense': '/icons/mood-intense.png',
  'story-rich': '/icons/mood-story.png',
  'brainless': '/icons/mood-brainless.png',
  'atmospheric': '/icons/mood-atmospheric.png',
  'competitive': '/icons/mood-competitive.png',
  'spooky': '/icons/mood-spooky.png',
  'creative': '/icons/mood-creative.png',
  'strategic': '/icons/mood-strategic.png',
  'emotional': '/icons/mood-emotional.png',
};

export const STATUS_ICONS: Record<string, string | null> = {
  'buried': '/icons/status-backlog.png',
  'on-deck': '/icons/status-playnext.png',
  'playing': '/icons/status-nowplaying.png',
  'played': '/icons/status-completed.png',
  'bailed': '/icons/status-moved-on.png',
};

export const REROLL_ICONS: Record<string, string | null> = {
  'anything': '/icons/reroll-anything.png',
  'quick-session': '/icons/reroll-quick.png',
  'deep-cut': null,      // Not yet created
  'continue': null,       // Not yet created
  'almost-done': null,    // Not yet created
};
