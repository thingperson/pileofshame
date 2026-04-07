import { MoodTag, TimeTier } from './types';
import { RerollMode, EnergyLevel } from './reroll';

const STORAGE_KEY = 'if-decision-history';
const MAX_ENTRIES = 100;

export interface DecisionRecord {
  gameId: string;
  gameName: string;
  mode: RerollMode;
  action: 'accept' | 'skip';
  moodFilters: MoodTag[];
  energy: EnergyLevel;
  genres: string[];
  timeTier: TimeTier;
  timestamp: string;
}

export function getDecisionHistory(): DecisionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordDecision(record: DecisionRecord): void {
  const history = getDecisionHistory();
  history.push(record);
  // Keep only the last MAX_ENTRIES
  if (history.length > MAX_ENTRIES) {
    history.splice(0, history.length - MAX_ENTRIES);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearDecisionHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
