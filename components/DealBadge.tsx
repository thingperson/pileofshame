'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackDealCheck } from '@/lib/analytics';

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

// Simple in-memory cache to avoid hammering IsThereAnyDeal
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
        // Filter out 0% discount "deals" — those are just full-price listings
        const realDeals = data.deals.filter((d: Deal) => d.savings > 0);
        if (realDeals.length > 0) {
          const filtered = { ...data, deals: realDeals };
          setDeal(filtered);
          trackDealCheck(gameName);
          dealCache.set(gameName, { data: filtered, timestamp: Date.now() });
        } else {
          dealCache.set(gameName, { data: null, timestamp: Date.now() });
        }
      } else {
        dealCache.set(gameName, { data: null, timestamp: Date.now() });
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [gameName]);

  // Auto-fetch on mount (card expanded = component mounted)
  useEffect(() => {
    if (!compact) {
      fetchDeal();
    }
  }, [compact, fetchDeal]);

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

  // Exciting deal copy based on discount
  const getDealCopy = (savings: number): string => {
    if (savings >= 75) return '🚨 Steal alert!';
    if (savings >= 50) return '🔥 Seriously discounted.';
    if (savings >= 30) return '💰 Deal spotted.';
    return '🏷️ On sale.';
  };

  // Expanded view — auto-fetches and shows exciting deal info
  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      {loading && (
        <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)] animate-pulse">
          🔍 Hunting for deals...
        </span>
      )}

      {bestDeal && (
        <div className="space-y-1">
          <a
            href={bestDeal.dealUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-wrap items-center gap-2 text-xs font-[family-name:var(--font-mono)] rounded-lg px-3 py-2 transition-all hover:scale-[1.01] cursor-pointer"
            style={{
              backgroundColor: bestDeal.savings >= 50 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${bestDeal.savings >= 50 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}
          >
            <span style={{ color: bestDeal.savings >= 50 ? '#22c55e' : '#f59e0b' }}>
              {getDealCopy(bestDeal.savings)}
            </span>
            <span
              className="px-1.5 py-0.5 rounded font-bold"
              style={{
                backgroundColor: bestDeal.savings >= 50 ? '#22c55e15' : '#f59e0b15',
                color: bestDeal.savings >= 50 ? '#22c55e' : '#f59e0b',
              }}
            >
              ${bestDeal.price.toFixed(2)}
            </span>
            <span className="text-text-dim">
              {bestDeal.savings}% off at {bestDeal.store}
            </span>
            <span className="text-accent-purple text-[11px]">Grab it →</span>
          </a>

          {deal.deals.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-[10px] text-text-faint hover:text-text-dim font-[family-name:var(--font-mono)] ml-1 transition-colors"
            >
              {expanded ? '▾ Hide other stores' : `▸ ${deal.deals.length - 1} more store${deal.deals.length > 2 ? 's' : ''}`}
            </button>
          )}

          {expanded && deal.deals.length > 1 && (
            <div className="ml-2 space-y-1 pt-1">
              {deal.deals.slice(1, 5).map((d, i) => (
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
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {(bestDeal || (expanded && deal && deal.deals.length > 1)) && (
        <p className="text-[9px] text-text-faint/50 font-[family-name:var(--font-mono)] mt-1">
          Deal links may earn us a small commission at no cost to you.
        </p>
      )}
    </div>
  );
}
