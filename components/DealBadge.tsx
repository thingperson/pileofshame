'use client';

import { useState, useEffect, useCallback } from 'react';

interface Deal {
  store: string;
  price: number;
  retailPrice: number;
  savings: number;
  dealUrl: string;
  isAffiliate: boolean;
}

interface DealData {
  name: string;
  cheapest: string;
  cheapestEver: { price: number; date: string } | null;
  deals: Deal[];
}

interface DealBadgeProps {
  gameName: string;
  compact?: boolean;
}

// Simple in-memory cache to avoid hammering CheapShark
const dealCache = new Map<string, { data: DealData | null; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export default function DealBadge({ gameName, compact = false }: DealBadgeProps) {
  const [deal, setDeal] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchDeal = useCallback(async () => {
    // Check cache first
    const cached = dealCache.get(gameName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setDeal(cached.data);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/deals?action=search&title=${encodeURIComponent(gameName)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.deals && data.deals.length > 0) {
        setDeal(data);
        dealCache.set(gameName, { data, timestamp: Date.now() });
      } else {
        dealCache.set(gameName, { data: null, timestamp: Date.now() });
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [gameName]);

  // Only fetch when explicitly requested (don't auto-fetch for every card)
  const bestDeal = deal?.deals?.[0];

  if (compact) {
    // Inline badge for compact card view — only shows if already cached
    const cached = dealCache.get(gameName);
    if (!cached?.data) return null;
    const best = cached.data.deals?.[0];
    if (!best || best.savings < 20) return null;

    return (
      <a
        href={best.dealUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="px-1.5 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-mono)] transition-all hover:scale-105"
        style={{
          backgroundColor: '#22c55e15',
          color: '#22c55e',
          border: '1px solid #22c55e30',
        }}
        title={`${best.savings}% off at ${best.store}`}
      >
        ${best.price.toFixed(2)}
      </a>
    );
  }

  // Expanded view — shows full deal info with check button
  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      {!deal && !loading && (
        <button
          onClick={(e) => { e.stopPropagation(); fetchDeal(); }}
          className="text-[11px] text-text-dim hover:text-accent-purple font-[family-name:var(--font-mono)] transition-colors"
        >
          💰 Check deals
        </button>
      )}

      {loading && (
        <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">
          Checking prices...
        </span>
      )}

      {bestDeal && (
        <div className="space-y-1">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-mono)]"
          >
            <span
              className="px-1.5 py-0.5 rounded font-bold"
              style={{
                backgroundColor: bestDeal.savings >= 50 ? '#22c55e15' : '#f59e0b15',
                color: bestDeal.savings >= 50 ? '#22c55e' : '#f59e0b',
                border: `1px solid ${bestDeal.savings >= 50 ? '#22c55e30' : '#f59e0b30'}`,
              }}
            >
              ${bestDeal.price.toFixed(2)}
            </span>
            <span className="text-text-dim">
              {bestDeal.savings}% off at {bestDeal.store}
            </span>
            {deal.cheapestEver && (
              <span className="text-text-faint">
                (lowest ever: ${deal.cheapestEver.price.toFixed(2)})
              </span>
            )}
          </button>

          {expanded && deal.deals.length > 1 && (
            <div className="ml-2 space-y-1 pt-1">
              {deal.deals.slice(0, 4).map((d, i) => (
                <a
                  key={i}
                  href={d.dealUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-mono)] text-text-dim hover:text-text-secondary transition-colors"
                >
                  <span className="w-12 text-right font-bold" style={{ color: d.savings >= 50 ? '#22c55e' : '#f59e0b' }}>
                    ${d.price.toFixed(2)}
                  </span>
                  <span className="text-text-faint">({d.savings}%)</span>
                  <span>{d.store}</span>
                  {d.isAffiliate && <span className="text-[9px] text-text-faint">↗</span>}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {deal && deal.deals.length === 0 && (
        <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">
          No deals right now
        </span>
      )}
    </div>
  );
}
