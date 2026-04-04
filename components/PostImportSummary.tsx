'use client';

import { useState, useEffect } from 'react';

interface ImportBreakdown {
  total: number;
  backlog: number;    // 0 hours, pure backlog
  started: number;    // 1+ hours, still backlog but flagged
  upNext: number;     // 5+ hours, auto-moved to Up Next
  completed: number;  // hours >= HLTB threshold, auto-completed
}

interface PostImportSummaryProps {
  breakdown: ImportBreakdown;
  onDismiss: () => void;
}

export default function PostImportSummary({ breakdown, onDismiss }: PostImportSummaryProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in after a brief pause
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const hasSmartSorting = breakdown.started > 0 || breakdown.upNext > 0 || breakdown.completed > 0;
  const realBacklog = breakdown.backlog;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative rounded-xl border overflow-hidden transition-all duration-500 mb-4 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        backgroundColor: 'rgba(167, 139, 250, 0.08)',
        borderColor: 'rgba(167, 139, 250, 0.3)',
        boxShadow: '0 0 24px rgba(167, 139, 250, 0.06)',
      }}
    >
      {/* Close X */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-text-faint hover:text-text-muted hover:bg-white/5 transition-all"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div className="px-5 py-5 space-y-3">
        <div className="text-center">
          <p className="text-xl font-bold text-text-primary">
            {breakdown.total} games imported
          </p>
          {hasSmartSorting ? (
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-sm mx-auto">
              We looked at your playtime and sorted them for you.
              {breakdown.total !== realBacklog && (
                <> Your actual backlog is <span className="text-accent-purple font-semibold">{realBacklog}</span> games, not {breakdown.total}.</>
              )}
            </p>
          ) : (
            <p className="text-xs text-text-muted mt-1">
              All added to your backlog. Hit &ldquo;What Should I Play?&rdquo; when you&apos;re ready.
            </p>
          )}
        </div>

        {hasSmartSorting && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryStat label="Backlog" count={realBacklog} icon="📚" color="#64748b" />
            {breakdown.started > 0 && (
              <SummaryStat label="Started" count={breakdown.started} icon="👀" color="#a78bfa" sub="have playtime" />
            )}
            {breakdown.upNext > 0 && (
              <SummaryStat label="Up Next" count={breakdown.upNext} icon="🎯" color="#38bdf8" sub="jump back in" />
            )}
            {breakdown.completed > 0 && (
              <SummaryStat label="Completed" count={breakdown.completed} icon="✅" color="#22c55e" sub="already behind you" />
            )}
          </div>
        )}

        {breakdown.completed > 0 && (
          <p className="text-[10px] text-text-faint text-center font-[family-name:var(--font-mono)]">
            We guessed {breakdown.completed} game{breakdown.completed !== 1 ? 's are' : ' is'} already beaten based on your playtime. Wrong? Move them back anytime.
          </p>
        )}

        <button
          onClick={onDismiss}
          className="w-full py-2.5 text-xs font-medium rounded-lg border transition-all hover:bg-white/5 active:scale-[0.98] font-[family-name:var(--font-mono)]"
          style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function SummaryStat({ label, count, icon, color, sub }: {
  label: string;
  count: number;
  icon: string;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ backgroundColor: `${color}10` }}
    >
      <p className="text-lg font-bold" style={{ color }}>{count}</p>
      <p className="text-[10px] font-medium text-text-muted">{icon} {label}</p>
      {sub && <p className="text-[9px] text-text-faint mt-0.5">{sub}</p>}
    </div>
  );
}
