'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface RawgResult {
  slug: string;
  name: string;
  coverUrl: string | null;
  metacritic: number | null;
  genres: string[];
  platforms: string[];
  released: string | null;
  rating: number | null;
}

interface GameSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: RawgResult) => void;
}

export default function GameSearch({ value, onChange, onSelect }: GameSearchProps) {
  const [results, setResults] = useState<RawgResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = 'game-search-results';

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/rawg?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setShowDropdown(true);
      }
    } catch {
      // silently fail, user can still type manually
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, search]);

  // Reset active highlight whenever the result set changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (result: RawgResult) => {
    onChange(result.name);
    setShowDropdown(false);
    onSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        // Re-open dropdown on ArrowDown if it was closed
        setShowDropdown(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < results.length) {
          e.preventDefault();
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a game..."
          aria-label="Search for a game to add"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `${listboxId}-${results[activeIndex].slug}`
              : undefined
          }
          autoFocus
          className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Game search results"
          className="absolute z-50 w-full mt-1 rounded-xl border overflow-hidden shadow-xl max-h-[320px] overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-active)',
          }}
        >
          {results.map((result, idx) => (
            <button
              key={result.slug}
              id={`${listboxId}-${result.slug}`}
              type="button"
              role="option"
              aria-selected={activeIndex === idx}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                activeIndex === idx ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              {result.coverUrl ? (
                <img
                  src={result.coverUrl}
                  alt=""
                  className="w-12 h-8 rounded object-cover shrink-0 bg-bg-primary"
                />
              ) : (
                <div className="w-12 h-8 rounded bg-bg-primary shrink-0 flex items-center justify-center text-text-faint text-xs">
                  ?
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {result.name}
                </p>
                <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] truncate">
                  {result.released ? result.released.slice(0, 4) : ''}
                  {result.genres.length > 0 && (result.released ? ' · ' : '') + result.genres.slice(0, 2).join(', ')}
                  {result.metacritic && ` · ${result.metacritic}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
