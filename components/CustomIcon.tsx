'use client';

import Image from 'next/image';

interface CustomIconProps {
  src: string | null;
  fallback: string;  // emoji fallback
  size?: number;
  className?: string;
}

/**
 * Renders a custom DALL-E icon image, or falls back to emoji text.
 * Icons are displayed as small circular images with the background
 * cropped to just the icon content.
 */
export default function CustomIcon({ src, fallback, size = 18, className = '' }: CustomIconProps) {
  if (!src) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`inline-block rounded-sm object-cover ${className}`}
      unoptimized
    />
  );
}
