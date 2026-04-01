'use client';

import { useState } from 'react';
import SteamImportModal from './SteamImportModal';
import SteamWishlistModal from './SteamWishlistModal';
import XboxImportModal from './XboxImportModal';
import PlayniteImportModal from './PlayniteImportModal';
import PSNImportModal from './PSNImportModal';

interface ImportHubProps {
  open: boolean;
  onClose: () => void;
}

const PLATFORMS = [
  {
    id: 'steam',
    name: 'Steam',
    icon: '🟦',
    desc: 'Import via Steam username or profile URL',
    available: true,
  },
  {
    id: 'steam-wishlist',
    name: 'Steam Wishlist',
    icon: '⭐',
    desc: 'Track deals on games you want. Get notified when prices drop',
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
    desc: 'No public API. Use Playnite to export your Epic library',
    available: false,
  },
  {
    id: 'gog',
    name: 'GOG',
    icon: '🟪',
    desc: 'No public API. Use Playnite to export your GOG library',
    available: false,
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    icon: '🟥',
    desc: 'No API exists. Add games manually',
    available: false,
  },
] as const;

export default function ImportHub({ open, onClose }: ImportHubProps) {
  const [activeImport, setActiveImport] = useState<string | null>(null);

  if (!open) return null;

  // If a specific import modal is active, show that instead
  if (activeImport === 'steam') {
    return <SteamImportModal open={true} onClose={() => { setActiveImport(null); onClose(); }} />;
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
  if (activeImport === 'playstation') {
    return <PSNImportModal open={true} onClose={() => { setActiveImport(null); onClose(); }} />;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md max-h-[85vh] rounded-2xl border p-5 space-y-4 animate-[scaleIn_300ms_ease-out] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        <h2 className="text-lg font-bold text-text-primary">Import Games</h2>
        <p className="text-sm text-text-muted">
          Connect a platform or upload an export file.
        </p>

        <div className="space-y-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => {
                if (platform.available) {
                  setActiveImport(platform.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                platform.available
                  ? 'hover:bg-white/5 cursor-pointer'
                  : 'opacity-50 cursor-default'
              }`}
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <span className="text-xl shrink-0">{platform.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {platform.name}
                  {!platform.available && (
                    <span className="ml-2 text-[10px] text-text-faint font-[family-name:var(--font-mono)]">
                      MANUAL
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-text-dim">{platform.desc}</p>
              </div>
              {platform.available && (
                <svg className="w-4 h-4 text-text-dim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

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
