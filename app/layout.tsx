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
  title: "Pile Of Shame — Gaming Backlog Manager",
  description: "Stop organizing your backlog and start playing. Add your games, hit Reroll, and go. Import from Steam, Xbox, and more.",
  metadataBase: new URL('https://pileofsha.me'),
  keywords: ['gaming backlog', 'backlog manager', 'game tracker', 'pile of shame', 'steam backlog', 'xbox backlog', 'gaming queue', 'what to play next', 'game randomizer', 'backlog tracker'],
  authors: [{ name: 'Pile Of Shame' }],
  openGraph: {
    title: 'Pile Of Shame',
    description: 'Your backlog isn\'t going to play itself. Add your games, hit Reroll, go play.',
    url: 'https://pileofsha.me',
    siteName: 'Pile Of Shame',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pile Of Shame — Gaming Backlog Manager',
    description: 'Stop organizing your backlog and start playing. Import from Steam & Xbox, hit Reroll, go.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://pileofsha.me',
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
              name: 'Pile Of Shame',
              url: 'https://pileofsha.me',
              description: 'Gaming backlog manager with randomizer. Import from Steam, Xbox, Playnite. Stop organizing, start playing.',
              applicationCategory: 'GameApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Steam library import',
                'Xbox library import',
                'Playnite CSV import',
                'Game randomizer (Reroll)',
                'Backlog tracking with 5-status pipeline',
                'Cover art and Metacritic scores via RAWG',
                'Dark theme',
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
