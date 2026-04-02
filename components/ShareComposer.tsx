'use client';

import { useState, useMemo } from 'react';
import { shareToTwitter, shareToReddit } from '@/lib/statsHelpers';
import { trackShareStats } from '@/lib/analytics';

interface ShareStats {
  backlog: number;
  cleared: number;
  bailed: number;
  hours: number;
  unplayedValue: number;
  playedValue: number;
  backlogHours: number;
  streak: number;
  oldest: string;
  pct: number;
}

interface ShareComposerProps {
  stats: ShareStats;
  showToast: (msg: string) => void;
}

// --- Composable stat lines ---

type StatLine = {
  id: string;
  label: string;
  available: (s: ShareStats) => boolean;
  text: (s: ShareStats) => string;
  defaultOn?: boolean;
};

const STAT_LINES: StatLine[] = [
  {
    id: 'backlog-size',
    label: 'Backlog size',
    available: (s) => s.backlog > 0,
    text: (s) => `My gaming backlog is ${s.backlog} games deep.`,
    defaultOn: true,
  },
  {
    id: 'cleared',
    label: 'Games cleared',
    available: (s) => s.cleared > 0,
    text: (s) => {
      if (s.cleared >= 10) return `I've cleared ${s.cleared} so far. Actually finishing games feels different.`;
      if (s.cleared >= 3) return `${s.cleared} cleared and counting.`;
      return `${s.cleared} down. The pile is shrinking.`;
    },
    defaultOn: true,
  },
  {
    id: 'value-reclaimed',
    label: 'Value reclaimed',
    available: (s) => s.playedValue >= 10,
    text: (s) => `I've reclaimed about $${s.playedValue.toLocaleString()} worth of real value from games I actually finished.`,
    defaultOn: true,
  },
  {
    id: 'untapped-value',
    label: 'Untapped value',
    available: (s) => s.unplayedValue >= 50,
    text: (s) => `$${s.unplayedValue.toLocaleString()} in games I own but haven't played. Working on it.`,
  },
  {
    id: 'backlog-hours',
    label: 'Time to clear',
    available: (s) => s.backlogHours > 0,
    text: (s) => {
      if (s.backlogHours > 5000) return `~${s.backlogHours.toLocaleString()} hours to play them all. That's ${(s.backlogHours / 24 / 365).toFixed(1)} years of non-stop gaming.`;
      return `Only ~${s.backlogHours.toLocaleString()} hours of playtime ahead of me to clear it all.`;
    },
  },
  {
    id: 'progress',
    label: 'Progress %',
    available: (s) => s.pct > 0,
    text: (s) => `${s.pct}% explored.`,
  },
  {
    id: 'streak',
    label: 'Clear streak',
    available: (s) => s.streak >= 3,
    text: (s) => `${s.streak}-game clear streak. On a roll.`,
  },
  {
    id: 'oldest',
    label: 'Oldest game',
    available: (s) => !!s.oldest,
    text: (s) => `${s.oldest} has been waiting the longest. It's next. Probably.`,
  },
  {
    id: 'bailed',
    label: 'Games bailed',
    available: (s) => s.bailed > 0,
    text: (s) => `Drew the line on ${s.bailed}. Knowing when to move on is progress too.`,
  },
  {
    id: 'hours-logged',
    label: 'Hours logged',
    available: (s) => s.hours > 0,
    text: (s) => `${s.hours.toLocaleString()} hours logged and counting.`,
  },
];

const FUN_CTAS = [
  'Try the 90s theme while you\'re there.',
  'Check what your library is worth.',
  'The pile is real.',
  'Mood-based matching is weirdly effective.',
  'The backlog effect is real.',
];

export default function ShareComposer({ stats, showToast }: ShareComposerProps) {
  const availableLines = useMemo(() => STAT_LINES.filter(l => l.available(stats)), [stats]);

  // Default: first 3 available lines
  const [selected, setSelected] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    for (const line of availableLines) {
      if (defaults.size >= 3) break;
      if (line.defaultOn) defaults.add(line.id);
    }
    // If fewer than 2 defaults, fill with first available
    if (defaults.size < 2) {
      for (const line of availableLines) {
        if (defaults.size >= 2) break;
        defaults.add(line.id);
      }
    }
    return defaults;
  });

  const [includeFunCta, setIncludeFunCta] = useState(true);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const funCta = useMemo(() => FUN_CTAS[Math.floor(Math.random() * FUN_CTAS.length)], []);

  const compose = (platform: 'twitter' | 'reddit' | 'discord'): string => {
    const lines: string[] = [];

    // Compose from selected stat lines
    for (const line of availableLines) {
      if (selected.has(line.id)) {
        lines.push(line.text(stats));
      }
    }

    if (lines.length === 0) {
      lines.push(`My gaming backlog is ${stats.backlog} games deep. Working on it.`);
    }

    if (includeFunCta) lines.push(funCta);

    // CTA
    switch (platform) {
      case 'twitter':
        lines.push('\ninventoryfull.gg');
        break;
      case 'reddit':
        lines.push('\n[inventoryfull.gg](https://inventoryfull.gg)');
        break;
      case 'discord':
        lines.push('\n<https://inventoryfull.gg>');
        break;
    }

    return lines.join(' ');
  };

  // Live preview
  const previewText = compose('discord').replace('\n<https://inventoryfull.gg>', '').replace('\ninventoryfull.gg', '').replace('\n[inventoryfull.gg](https://inventoryfull.gg)', '').trim();

  return (
    <div
      className="mt-3 rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}
    >
      <div className="text-xs font-semibold text-text-primary font-[family-name:var(--font-mono)]">
        📣 Compose your share
      </div>

      {/* Stat checkboxes */}
      <div className="grid grid-cols-2 gap-1.5">
        {availableLines.map((line) => (
          <button
            key={line.id}
            onClick={() => toggle(line.id)}
            className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-mono)] transition-all ${
              selected.has(line.id)
                ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30'
                : 'bg-bg-card text-text-faint border border-transparent hover:text-text-dim'
            }`}
          >
            <span className="mr-1">{selected.has(line.id) ? '✓' : '○'}</span>
            {line.label}
          </button>
        ))}
      </div>

      {/* Fun CTA toggle */}
      <button
        onClick={() => setIncludeFunCta(!includeFunCta)}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-mono)] transition-all ${
          includeFunCta
            ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30'
            : 'bg-bg-card text-text-faint border border-transparent hover:text-text-dim'
        }`}
      >
        <span className="mr-1">{includeFunCta ? '✓' : '○'}</span>
        Fun closer: &quot;{funCta}&quot;
      </button>

      {/* Live preview */}
      <div
        className="rounded-lg p-3 text-xs text-text-muted leading-relaxed font-[family-name:var(--font-mono)]"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="text-[10px] text-text-faint mb-1.5">Preview:</div>
        {previewText || <span className="text-text-faint italic">Pick some stats above</span>}
      </div>

      {/* Share buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => { trackShareStats('twitter'); shareToTwitter(compose('twitter')); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
            border: '1px solid rgba(29, 161, 242, 0.2)',
            color: '#1da1f2',
          }}
        >
          𝕏 Post
        </button>
        <button
          onClick={() => { trackShareStats('reddit'); shareToReddit(compose('reddit')); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(255, 69, 0, 0.1)',
            border: '1px solid rgba(255, 69, 0, 0.2)',
            color: '#ff4500',
          }}
        >
          📮 Reddit
        </button>
        <button
          onClick={() => {
            trackShareStats('discord');
            navigator.clipboard.writeText(compose('discord'));
            showToast('Copied! Paste it wherever you want.');
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(88, 101, 242, 0.1)',
            border: '1px solid rgba(88, 101, 242, 0.2)',
            color: '#5865f2',
          }}
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}
