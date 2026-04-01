'use client';

import { useState } from 'react';
import { GameSource, TimeTier } from '@/lib/types';
import { useStore } from '@/lib/store';
import { DEFAULT_VIBES, getVibeColor, SOURCE_LABELS, TIME_TIER_CONFIG } from '@/lib/constants';
import { useToast } from './Toast';
import GameSearch from './GameSearch';

interface AddGameModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddGameModal({ open, onClose }: AddGameModalProps) {
  const [name, setName] = useState('');
  const [source, setSource] = useState<GameSource>('steam');
  const [category, setCategory] = useState('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [timeTier, setTimeTier] = useState<TimeTier>('wind-down');
  const [notes, setNotes] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [rawgSlug, setRawgSlug] = useState<string | undefined>();
  const [metacritic, setMetacritic] = useState<number | undefined>();
  const [genres, setGenres] = useState<string[] | undefined>();

  const addGame = useStore((s) => s.addGame);
  const categories = useStore((s) => s.categories);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addGame({
      name: name.trim(),
      source,
      category: category || categories[0],
      vibes,
      timeTier,
      notes: notes.trim(),
      status: 'buried',
      coverUrl,
      rawgSlug,
      metacritic,
      genres,
    });

    showToast(`Added to ${category || categories[0]}. Now go play it.`);
    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setSource('steam');
    setCategory('');
    setVibes([]);
    setTimeTier('wind-down');
    setNotes('');
    setCoverUrl(undefined);
    setRawgSlug(undefined);
    setMetacritic(undefined);
    setGenres(undefined);
    onClose();
  };

  const toggleVibe = (vibe: string) => {
    setVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-5 space-y-4 animate-[scaleIn_300ms_ease-out]"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        <h2 className="text-lg font-bold text-text-primary">Add Game</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name — RAWG search with autocomplete */}
          <GameSearch
            value={name}
            onChange={setName}
            onSelect={(result) => {
              setCoverUrl(result.coverUrl || undefined);
              setRawgSlug(result.slug);
              setMetacritic(result.metacritic || undefined);
              setGenres(result.genres.length > 0 ? result.genres : undefined);
            }}
          />

          {/* Cover art preview */}
          {coverUrl && (
            <div className="flex items-center gap-3">
              <img
                src={coverUrl}
                alt=""
                className="w-20 h-12 rounded-lg object-cover bg-bg-primary"
              />
              <div className="flex-1 min-w-0">
                {metacritic && (
                  <span className="text-xs font-[family-name:var(--font-mono)] text-text-dim">
                    Metacritic: {metacritic}
                  </span>
                )}
                {genres && genres.length > 0 && (
                  <p className="text-[11px] text-text-faint truncate">
                    {genres.join(', ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCoverUrl(undefined);
                  setRawgSlug(undefined);
                  setMetacritic(undefined);
                  setGenres(undefined);
                }}
                className="text-xs text-text-dim hover:text-text-muted"
              >
                ✕
              </button>
            </div>
          )}

          {/* Source & Category */}
          <div className="flex gap-2">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as GameSource)}
              className="flex-1 text-sm bg-bg-primary border border-border-subtle rounded-lg px-2 py-2 text-text-secondary focus:outline-none focus:border-accent-purple"
            >
              {(Object.keys(SOURCE_LABELS) as GameSource[]).map((s) => (
                <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
              ))}
            </select>
            <select
              value={category || categories[0]}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 text-sm bg-bg-primary border border-border-subtle rounded-lg px-2 py-2 text-text-secondary focus:outline-none focus:border-accent-purple"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Vibes */}
          <div>
            <label className="block text-xs text-text-dim font-[family-name:var(--font-mono)] mb-1.5">
              Vibes
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_VIBES.map((vibe) => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => toggleVibe(vibe)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium font-[family-name:var(--font-mono)] transition-opacity ${
                    vibes.includes(vibe) ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor: `${getVibeColor(vibe)}15`,
                    color: getVibeColor(vibe),
                    border: `1px solid ${getVibeColor(vibe)}30`,
                  }}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          {/* Time Tier */}
          <div>
            <label className="block text-xs text-text-dim font-[family-name:var(--font-mono)] mb-1.5">
              Time Commitment
            </label>
            <div className="flex gap-2">
              {(Object.entries(TIME_TIER_CONFIG) as [TimeTier, typeof TIME_TIER_CONFIG[TimeTier]][]).map(
                ([tier, config]) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTimeTier(tier)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] border transition-all ${
                      timeTier === tier
                        ? 'border-accent-purple text-text-primary'
                        : 'border-border-subtle text-text-dim hover:text-text-muted'
                    }`}
                    style={{ backgroundColor: 'var(--color-bg-primary)' }}
                  >
                    {config.icon} {config.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-text-secondary placeholder-text-faint resize-none focus:outline-none focus:border-accent-purple"
            rows={2}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={resetAndClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
              style={{
                backgroundColor: 'var(--color-accent-purple)',
                color: '#0a0a0f',
              }}
            >
              Add Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
