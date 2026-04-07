'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

const SESSION_KEY = 'if-import-summary-dismissed';

export default function PostImportSummary({ breakdown, onDismiss }: PostImportSummaryProps) {
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Check sessionStorage on mount — skip if already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) {
      onDismiss();
      return;
    }
    // Animate in after a brief pause
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
    // Wait for fade-out animation before removing from DOM
    setTimeout(() => onDismiss(), 200);
  }, [onDismiss]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  const hasSmartSorting = breakdown.started > 0 || breakdown.upNext > 0 || breakdown.completed > 0;
  const realBacklog = breakdown.backlog;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Import Summary"
        className={`relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border overflow-hidden transition-all duration-300 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        {/* Close X */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-lg text-text-faint hover:text-text-muted hover:bg-white/5 transition-all z-10"
          aria-label="Dismiss import summary"
        >
          &#x2715;
        </button>

        <div className="px-5 py-6 space-y-4">
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
            <p className="text-xs text-text-faint text-center font-[family-name:var(--font-mono)]">
              We guessed {breakdown.completed} game{breakdown.completed !== 1 ? 's are' : ' is'} already beaten based on your playtime. Wrong? Move them back anytime.
            </p>
          )}

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 text-sm font-medium rounded-lg border transition-all hover:bg-white/5 active:scale-[0.98] font-[family-name:var(--font-mono)]"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}
          >
            Got it
          </button>
        </div>
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
      <p className="text-xs font-medium text-text-muted">{icon} {label}</p>
      {sub && <p className="text-xs text-text-faint mt-0.5">{sub}</p>}
    </div>
  );
}
