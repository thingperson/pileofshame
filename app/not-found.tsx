'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 50%, #0a0a0f 100%)' }}>
      <div className="text-center max-w-md space-y-6">
        <div className="relative mx-auto w-32 h-32 opacity-30">
          <Image
            src="/if-icon.png"
            alt="Inventory Full"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-6xl font-bold text-white/20 font-[family-name:var(--font-display)]">
          404
        </div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
          Nothing here but dust and regret.
        </h1>
        <p className="text-white/50 text-sm">
          Like that game you bought on sale three years ago and never installed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium transition-colors"
        >
          Back to your pile
        </Link>
      </div>
    </div>
  );
}
