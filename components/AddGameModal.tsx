'use client';

import { useState, useEffect, useRef } from 'react';
import { GameSource, TimeTier } from '@/lib/types';
import { useStore } from '@/lib/store';
import { SOURCE_LABELS, TIME_TIER_CONFIG } from '@/lib/constants';
import { useToast } from './Toast';
import GameSearch from './GameSearch';

interface AddGameModalProps {
  open: boolean;
  onClose: () => void;
  initialName?: string;
}

export default function AddGameModal({ open, onClose, initialName }: AddGameModalProps) {
  const [name, setName] = useState(initialName || '');
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

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync initialName when modal opens with a pre-filled name
  useEffect(() => {
    if (open && initialName) {
      setName(initialName);
    }
  }, [open, initialName]);

  // Escape to close + focus trapping
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetAndClose();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element on mount
    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add a game"
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
                  <p className="text-xs text-text-faint truncate">
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
                aria-label="Remove cover art"
                className="text-xs text-text-dim hover:text-text-muted"
              >
                ✕
              </button>
            </div>
          )}

          {/* Source & Category */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="add-game-source" className="block text-xs text-text-dim font-[family-name:var(--font-mono)] mb-1">Source</label>
              <select
                id="add-game-source"
                value={source}
                onChange={(e) => setSource(e.target.value as GameSource)}
                className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-2 py-2 text-text-secondary focus:outline-none focus:border-accent-purple"
              >
                {(Object.keys(SOURCE_LABELS) as GameSource[]).map((s) => (
                  <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="add-game-category" className="block text-xs text-text-dim font-[family-name:var(--font-mono)] mb-1">Category</label>
              <select
                id="add-game-category"
                value={category || categories[0]}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-2 py-2 text-text-secondary focus:outline-none focus:border-accent-purple"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
            aria-label="Game notes"
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
