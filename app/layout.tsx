import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Nunito } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import FeedbackWidget from "@/components/FeedbackWidget";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-cozy",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Inventory Full - get playing.",
  description: "Inventory Full helps you pick the right game from your backlog by mood and time. Import Steam, Xbox, PlayStation. Free, no sign-up required.",
  metadataBase: new URL('https://inventoryfull.gg'),
  keywords: ['gaming backlog', 'backlog manager', 'game tracker', 'inventory full', 'steam backlog', 'xbox backlog', 'gaming queue', 'what to play next', 'game randomizer', 'backlog tracker', 'backlog payback'],
  authors: [{ name: 'Inventory Full' }],
  openGraph: {
    title: 'Inventory Full - get playing.',
    description: 'Inventory Full helps you pick the right game from your backlog by mood and time. Import Steam, Xbox, PlayStation. Free, no sign-up required.',
    url: 'https://inventoryfull.gg',
    siteName: 'Inventory Full',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://inventoryfull.gg/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Inventory Full - get playing.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inventory Full - get playing.',
    description: 'Inventory Full helps you pick the right game from your backlog by mood and time. Import Steam, Xbox, PlayStation. Free, no sign-up required.',
    images: ['https://inventoryfull.gg/opengraph-image'],
  },
  other: {
    'theme-color': '#7c3aed',
    'mobile-web-app-capable': 'yes',
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
  icons: {
    icon: [
      // No-media fallback for browsers that don't support prefers-color-scheme on favicons.
      { url: '/inventoryfull-icon-256.png', type: 'image/png', sizes: '256x256' },
      // Light-scheme: dark "I" + teal "F" — visible on light browser tabs.
      { url: '/favicon-light-16.png', type: 'image/png', sizes: '16x16', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-light-32.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-light-192.png', type: 'image/png', sizes: '192x192', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-light-512.png', type: 'image/png', sizes: '512x512', media: '(prefers-color-scheme: light)' },
      // Dark-scheme: white "I" + teal "F" — visible on dark browser tabs.
      { url: '/favicon-dark-16.png', type: 'image/png', sizes: '16x16', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-32.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-192.png', type: 'image/png', sizes: '192x192', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-512.png', type: 'image/png', sizes: '512x512', media: '(prefers-color-scheme: dark)' },
    ],
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
      className={`${outfit.variable} ${jetbrainsMono.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
          <link rel="preload" as="image" href="/IF-landing-BG.webp" type="image/webp" />
        </head>
      <body className="min-h-full flex flex-col relative">
        {/* Restore text size preference before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('if-text-size')==='comfortable')document.documentElement.classList.add('comfortable')}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Inventory Full',
              url: 'https://inventoryfull.gg',
              description: 'Inventory Full helps you pick the right game from your backlog by mood and time. Import from Steam, Xbox, PlayStation, Playnite. Free, no sign-up required.',
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
        <FeedbackWidget />
        <CookieBanner />
      </body>
    </html>
  );
}
