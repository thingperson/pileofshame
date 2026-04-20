import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your stats - Inventory Full',
  description: 'See what your game library says about you. Archetype, value recovered, games cleared, time invested. Yours only. We never sell or share your data.',
  alternates: {
    canonical: 'https://inventoryfull.gg/stats',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Your stats - Inventory Full',
    description: 'See what your game library says about you.',
    url: 'https://inventoryfull.gg/stats',
    type: 'website',
  },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
