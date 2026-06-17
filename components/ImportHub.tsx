'use client';

import { useEffect, useRef, useState } from 'react';
import SteamImportModal from './SteamImportModal';
import SteamWishlistModal from './SteamWishlistModal';
import XboxImportModal from './XboxImportModal';
import PlayniteImportModal from './PlayniteImportModal';
import PSNImportModal from './PSNImportModal';

interface ImportHubProps {
  open: boolean;
  onClose: () => void;
  // Set when returning from the Steam OpenID full-page redirect fallback —
  // jump straight into the Steam importer with this verified SteamID64.
  autoSteamId?: string;
}

const PLATFORMS = [
  {
    id: 'steam',
    name: 'Steam',
    icon: '🟦',
    desc: 'Import via Steam username or profile URL',
    available: true,
    recommended: true,
  },
  {
    id: 'steam-wishlist',
    name: 'Steam Wishlist',
    icon: '⭐',
    desc: 'Pull in your Steam wishlist so it\'s here when you want it.',
    available: true,
  },
  {
    id: 'xbox',
    name: 'Xbox',
    icon: '🟩',
    desc: 'Import via Gamertag (profile must be public)',
    available: true,
    needsKey: 'OPENXBL_API_KEY',
  },
  {
    id: 'playnite',
    name: 'Playnite',
    icon: '🔷',
    desc: 'Import CSV. Covers Steam, GOG, Epic, PS, Xbox, and more',
    available: true,
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    icon: '🔵',
    desc: 'Import via PSN login token. Takes 30 seconds',
    available: true,
  },
  {
    id: 'epic',
    name: 'Epic Games',
    icon: '⬛',
    desc: 'No public API. Import via a Playnite CSV export',
    available: true,
  },
  {
    id: 'gog',
    name: 'GOG',
    icon: '🟪',
    desc: 'No public API. Import via a Playnite CSV export',
    available: true,
  },
] as const;

const MANUAL_PLATFORMS = [
  {
    id: 'switch',
    name: 'Nintendo Switch',
    icon: '🟥',
    desc: 'No API exists. Add games manually',
  },
] as const;

export default function ImportHub({ open, onClose, autoSteamId }: ImportHubProps) {
  const [activeImport, setActiveImport] = useState<string | null>(null);

  // Returning from the Steam OpenID redirect fallback: skip the platform list.
  useEffect(() => {
    if (open && autoSteamId) setActiveImport('steam');
  }, [open, autoSteamId]);

  if (!open) return null;

  // If a specific import modal is active, show that instead
  if (activeImport === 'steam') {
    return <SteamImportModal open={true} initialSteamId={autoSteamId} onClose={() => { setActiveImport(null); onClose(); }} />;
  }
  if (activeImport === 'xbox') {
    return <XboxImportModal open={true} onClose={() => { setActiveImport(null); onClose(); }} />;
  }
  if (activeImport === 'steam-wishlist') {
    return <SteamWishlistModal open={true} onClose={() => { setActiveImport(null); onClose(); }} />;
  }
  if (activeImport === 'playnite') {
    return <PlayniteImportModal open={true} onClose={() => { setActiveImport(null); onClose(); }} />;
  }
  if (activeImport === 'epic') {
    return <PlayniteImportModal open={true} context="epic" onClose={() => { setActiveImport(null); onClose(); }} />;
  }
  if (activeImport === 'gog') {
    return <PlayniteImportModal open={true} context="gog" onClose={() => { setActiveImport(null); onClose(); }} />;
  }
  if (activeImport === 'playstation') {
    return <PSNImportModal open={true} onClose={() => { setActiveImport(null); onClose(); }} />;
  }

  return (
    <ImportHubModal open={open} onClose={onClose} setActiveImport={setActiveImport} />
  );
}

function ImportHubModal({ open, onClose, setActiveImport }: { open: boolean; onClose: () => void; setActiveImport: (id: string) => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
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
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener('keydown', handler);

    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handler);
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Import Games"
        className="relative w-full max-w-md max-h-[85vh] rounded-2xl border p-5 space-y-4 animate-[scaleIn_300ms_ease-out] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        <h2 className="text-lg font-bold text-text-primary">Import Games</h2>
        <p className="text-sm text-text-muted">
          Pick your platform. Steam takes about 20 seconds.
        </p>

        <div className="space-y-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setActiveImport(platform.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-glass-subtle cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <span className="text-xl shrink-0">{platform.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {platform.name}
                </p>
                <p className="text-xs text-text-dim">{platform.desc}</p>
              </div>
              <svg className="w-4 h-4 text-text-dim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <details className="group">
          <summary className="text-xs text-text-dim hover:text-text-muted cursor-pointer list-none flex items-center gap-1 py-2">
            <span>Don't see your platform?</span>
            <span className="transition-transform group-open:rotate-90">→</span>
          </summary>
          <div className="space-y-2 pt-2">
            {MANUAL_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl opacity-60"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <span className="text-xl shrink-0">{platform.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {platform.name}
                    <span className="ml-2 text-xs text-text-faint font-[family-name:var(--font-mono)]">
                      MANUAL
                    </span>
                  </p>
                  <p className="text-xs text-text-dim">{platform.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </details>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
