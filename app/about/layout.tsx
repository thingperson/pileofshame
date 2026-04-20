import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Inventory Full - what we do, why we built it',
  description: 'Inventory Full helps you decide what to play now based on mood and time, make ongoing progress on the games you already own, and recover more value from your collection.',
  alternates: {
    canonical: 'https://inventoryfull.gg/about',
  },
  openGraph: {
    title: 'About Inventory Full - what we do, why we built it',
    description: 'Decide what to play now. Make progress on games you already own. Recover value from your collection.',
    url: 'https://inventoryfull.gg/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Inventory Full - what we do, why we built it',
    description: 'Decide what to play now. Make progress on games you already own. Recover value from your collection.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
