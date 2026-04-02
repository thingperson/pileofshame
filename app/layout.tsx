import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Inventory Full: Gaming Backlog Manager",
  description: "Your backlog is full. Your time doesn't have to be. Import your games, tell us your mood, and we'll find your game tonight.",
  metadataBase: new URL('https://inventoryfull.gg'),
  keywords: ['gaming backlog', 'backlog manager', 'game tracker', 'inventory full', 'steam backlog', 'xbox backlog', 'gaming queue', 'what to play next', 'game randomizer', 'backlog tracker', 'backlog payback'],
  authors: [{ name: 'Inventory Full' }],
  openGraph: {
    title: 'Inventory Full',
    description: 'Your backlog is full. Your time doesn\'t have to be. Clear space. Recover fun.',
    url: 'https://inventoryfull.gg',
    siteName: 'Inventory Full',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Inventory Full: Gaming Backlog Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inventory Full: Gaming Backlog Manager',
    description: 'Your backlog is full. Your time doesn\'t have to be. Import from Steam & Xbox, clear space, recover fun.',
    images: ['/opengraph-image'],
  },
  other: {
    'theme-color': '#7c3aed',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://inventoryfull.gg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Inventory Full',
              url: 'https://inventoryfull.gg',
              description: 'Gaming backlog manager. Your backlog is full. Your time doesn\'t have to be. Import from Steam, Xbox, Playnite. Clear space, recover fun.',
              applicationCategory: 'GameApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Steam library import',
                'Steam wishlist import',
                'Xbox library import',
                'Playnite CSV import',
                'Game randomizer (What Should I Play?)',
                'Backlog tracking with 5-status pipeline',
                'Backlog Payback — value recovered tracking',
                'Deal checking via IsThereAnyDeal',
                'Cover art and Metacritic scores via RAWG',
                'Cloud sync with Discord and Google sign-in',
                'Multiple themes including retro modes',
                'PWA — Add to Home Screen',
                'Mobile-first responsive design',
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
