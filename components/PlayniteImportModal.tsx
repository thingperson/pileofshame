'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackImport } from '@/lib/analytics';
import { GameSource } from '@/lib/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

interface ParsedGame {
  name: string;
  source: GameSource;
  playtimeHours: number;
  genres: string[];
  completionStatus: string;
  notes: string;
  selected: boolean;
}

// Map Playnite's Library/Platform field to our GameSource
function mapSource(library: string, platform: string): GameSource {
  const combined = `${library} ${platform}`.toLowerCase();
  if (combined.includes('steam')) return 'steam';
  if (combined.includes('playstation') || combined.includes('psn') || combined.includes('ps4') || combined.includes('ps5') || combined.includes('ps3')) return 'playstation';
  if (combined.includes('xbox') || combined.includes('microsoft')) return 'xbox';
  if (combined.includes('epic')) return 'epic';
  if (combined.includes('nintendo') || combined.includes('switch')) return 'switch';
  if (combined.includes('gog')) return 'gog';
  return 'other';
}

// Map Playnite completion status to our status
function mapStatus(completionStatus: string): 'buried' | 'playing' | 'played' | 'bailed' {
  const status = completionStatus.toLowerCase();
  if (status.includes('beaten') || status.includes('completed') || status.includes('100%')) return 'played';
  if (status.includes('playing') || status.includes('in progress')) return 'playing';
  if (status.includes('abandoned') || status.includes('dropped')) return 'bailed';
  return 'buried';
}

function parseCSV(text: string): ParsedGame[] {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  // Parse header row — handle quoted fields
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());

  // Find column indices — flexible matching
  const nameIdx = headers.findIndex((h) => h === 'name' || h === 'title');
  const libraryIdx = headers.findIndex((h) => h === 'library' || h === 'source');
  const platformIdx = headers.findIndex((h) => h === 'platform' || h === 'platforms');
  const genresIdx = headers.findIndex((h) => h === 'genres' || h === 'genre');
  const playtimeIdx = headers.findIndex((h) => h === 'playtime' || h === 'time played');
  const completionIdx = headers.findIndex((h) => h === 'completionstatus' || h === 'completion status' || h === 'status');
  const notesIdx = headers.findIndex((h) => h === 'notes');

  if (nameIdx === -1) return []; // Must have at least a name column

  const games: ParsedGame[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const name = cols[nameIdx]?.trim();
    if (!name) continue;

    const library = libraryIdx >= 0 ? cols[libraryIdx]?.trim() || '' : '';
    const platform = platformIdx >= 0 ? cols[platformIdx]?.trim() || '' : '';
    const genresRaw = genresIdx >= 0 ? cols[genresIdx]?.trim() || '' : '';
    const playtimeRaw = playtimeIdx >= 0 ? cols[playtimeIdx]?.trim() || '' : '';
    const completion = completionIdx >= 0 ? cols[completionIdx]?.trim() || '' : '';
    const notes = notesIdx >= 0 ? cols[notesIdx]?.trim() || '' : '';

    // Parse playtime — Playnite stores in seconds
    let playtimeHours = 0;
    const playtimeNum = parseInt(playtimeRaw);
    if (!isNaN(playtimeNum)) {
      playtimeHours = Math.round((playtimeNum / 3600) * 10) / 10;
    }

    const genres = genresRaw ? genresRaw.split(',').map((g) => g.trim()).filter(Boolean) : [];

    games.push({
      name,
      source: mapSource(library, platform),
      playtimeHours,
      genres,
      completionStatus: completion,
      notes,
      selected: true,
    });
  }

  return games;
}

// Handle quoted CSV fields properly
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

interface PlayniteImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PlayniteImportModal({ open, onClose }: PlayniteImportModalProps) {
  const [step, setStep] = useState<'upload' | 'select'>('upload');
  const [games, setGames] = useState<ParsedGame[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setError("Couldn't find any games in that file. Make sure it's a Playnite CSV export.");
        return;
      }

      // Filter out already-imported games by name
      const existingNames = new Set(existingGames.map((g) => g.name.toLowerCase()));
      const newGames = parsed.map((g) => ({
        ...g,
        selected: !existingNames.has(g.name.toLowerCase()),
      }));

      setGames(newGames);
      setStep('select');
    } catch {
      setError('Failed to read file.');
    }
    e.target.value = '';
  }, [existingGames]);

  const toggleGame = (idx: number) => {
    setGames((prev) => prev.map((g, i) => i === idx ? { ...g, selected: !g.selected } : g));
  };

  const selectAll = () => setGames((prev) => prev.map((g) => ({ ...g, selected: true })));
  const deselectAll = () => setGames((prev) => prev.map((g) => ({ ...g, selected: false })));

  const handleImport = () => {
    const toImport = games.filter((g) => g.selected);
    for (const game of toImport) {
      addGame({
        name: game.name,
        source: game.source,
        status: mapStatus(game.completionStatus),
        category: DEFAULT_CATEGORIES[0],
        vibes: [],
        timeTier: game.playtimeHours > 50 ? 'marathon' : game.playtimeHours > 20 ? 'deep-cut' : game.playtimeHours > 5 ? 'wind-down' : 'quick-hit',
        notes: game.notes,
        hoursPlayed: game.playtimeHours,
        genres: game.genres.length > 0 ? game.genres : undefined,
      });
    }
    trackImport('playnite', toImport.length);
    showToast(`Imported ${toImport.length} games from Playnite.`);
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setGames([]);
    setError('');
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  const selectedCount = games.filter((g) => g.selected).length;
  const alreadyImported = games.filter((g) => !g.selected && existingGames.some((eg) => eg.name.toLowerCase() === g.name.toLowerCase())).length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import from Playnite"
        className="relative w-full max-w-lg max-h-[85vh] rounded-2xl border p-5 space-y-4 animate-[scaleIn_300ms_ease-out] flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        <h2 className="text-lg font-bold text-text-primary">Import from Playnite</h2>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm text-text-secondary">
              <p>Playnite can export your entire library — including games from Steam, GOG, Epic, PlayStation, Xbox, and more.</p>
              <div className="space-y-2 text-xs text-text-muted">
                <p className="font-medium text-text-secondary">How to export:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open <a href="https://playnite.link" target="_blank" rel="noopener" className="text-accent-purple hover:underline">Playnite</a> on your PC</li>
                  <li>Go to <span className="font-[family-name:var(--font-mono)] text-text-secondary">Main Menu → Library → Export</span></li>
                  <li>Choose <span className="font-[family-name:var(--font-mono)] text-text-secondary">CSV</span> format</li>
                  <li>Save and upload the file here</li>
                </ol>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 text-sm font-bold rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--color-accent-purple)',
                color: '#0a0a0f',
              }}
            >
              Choose CSV File
            </button>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Cancel
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        )}

        {step === 'select' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                {selectedCount} selected · {games.length} found
                {alreadyImported > 0 && ` · ${alreadyImported} already imported`}
              </span>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-accent-purple hover:underline">All</button>
                <button onClick={deselectAll} className="text-xs text-text-dim hover:text-text-muted">None</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[50vh]">
              {games.map((game, idx) => {
                const isExisting = existingGames.some((eg) => eg.name.toLowerCase() === game.name.toLowerCase());
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      game.selected ? 'bg-white/5' : ''
                    } ${isExisting ? 'opacity-40' : 'hover:bg-white/5'}`}
                  >
                    <input
                      type="checkbox"
                      checked={game.selected}
                      onChange={() => toggleGame(idx)}
                      className="rounded accent-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{game.name}</p>
                      <p className="text-[11px] text-text-dim font-[family-name:var(--font-mono)]">
                        {game.source}
                        {game.playtimeHours > 0 && ` · ${game.playtimeHours}h`}
                        {game.completionStatus && ` · ${game.completionStatus}`}
                        {isExisting && ' · already imported'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0}
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                Import {selectedCount} Games
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
