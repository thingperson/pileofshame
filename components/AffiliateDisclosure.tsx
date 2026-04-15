/**
 * FTC-compliant affiliate disclosure, rendered inline at the point of click.
 *
 * Usage: place directly next to, above, or inside every deal card or
 * store-link surface that carries an affiliate parameter. The disclosure
 * must be visible at the point of decision — not buried in the privacy
 * policy alone. This matches FTC's "clear and conspicuous" standard.
 *
 * Variants:
 *   - 'inline'  — single short line. Use next to each deal.
 *   - 'block'   — slightly longer, use above a list of deals.
 *   - 'compact' — minimal superscript-style tag for dense surfaces.
 *
 * When deal UI ships, import this and render it. Do not ship deal links
 * without it.
 */
type Variant = 'inline' | 'block' | 'compact';

interface AffiliateDisclosureProps {
  variant?: Variant;
  className?: string;
}

export default function AffiliateDisclosure({
  variant = 'inline',
  className = '',
}: AffiliateDisclosureProps) {
  if (variant === 'compact') {
    return (
      <span
        className={`text-[10px] text-text-dim font-[family-name:var(--font-mono)] uppercase tracking-wider ${className}`}
        title="Some deal links include affiliate parameters. We may earn a small commission at no extra cost to you."
      >
        affiliate
      </span>
    );
  }

  if (variant === 'block') {
    return (
      <p className={`text-xs text-text-dim leading-relaxed ${className}`}>
        Some deal links include affiliate parameters. If you buy through them,
        we may earn a small commission at no extra cost to you. We only show
        deals on games already in your library or wishlist.
      </p>
    );
  }

  // inline (default)
  return (
    <p className={`text-[11px] text-text-dim ${className}`}>
      Affiliate link. We may earn a small commission at no extra cost to you.
    </p>
  );
}
