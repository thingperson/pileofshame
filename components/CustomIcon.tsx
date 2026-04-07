'use client';

interface CustomIconProps {
  src: string | null;
  fallback: string;  // emoji fallback
  size?: number;
  className?: string;
}

/**
 * Renders a custom DALL-E icon image, or falls back to emoji text.
 * Uses plain <img> instead of next/image — source files are already
 * optimized at 128x128 (~7KB each), no need for the optimizer.
 */
export default function CustomIcon({ src, fallback, size = 18, className = '' }: CustomIconProps) {
  if (!src) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`inline-block rounded-sm object-cover ${className}`}
      loading="eager"
    />
  );
}
