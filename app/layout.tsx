import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#7c3aed',
};

export const metadata: Metadata = {
  title: "Inventory Full - get playing.",
  description: "Can't decide what to play? Inventory Full picks the right game from your backlog based on mood and session length. Import Steam, Xbox, PlayStation. Free, no sign-up.",
  metadataBase: new URL('https://inventoryfull.gg'),
  keywords: [
    // High-intent queries (the user's actual mental state)
    'what game should I play',
    'decide what to play',
    'what to play next',
    'game decision paralysis',
    'too many games not enough time',
    'pile of shame',
    // Category / tool queries
    'gaming backlog',
    'gaming backlog tool',
    'backlog manager',
    'backlog tracker',
    'game randomizer',
    'game picker',
    // Library / platform queries
    'steam backlog',
    'xbox backlog',
    'playstation backlog',
    'steam library randomizer',
    // Brand
    'inventory full',
    'backlog payback',
  ],
  authors: [{ name: 'Inventory Full' }],
  openGraph: {
    title: 'Inventory Full - get playing.',
    description: "Can't decide what to play? Inventory Full picks the right game from your backlog based on mood and session length. Import Steam, Xbox, PlayStation. Free, no sign-up.",
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
    description: "Can't decide what to play? Inventory Full picks the right game from your backlog based on mood and session length. Import Steam, Xbox, PlayStation. Free, no sign-up.",
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
        {/* GA4 init (privacy-safe — only creates dataLayer + queue function;
            no cookies, no network requests until gtag.js loads, which is
            still consent-gated by CookieBanner). MUST run before any useEffect
            that calls trackLandingView etc., or the early events queue without
            a configured property and get dropped silently when gtag.js
            eventually processes the dataLayer.

            ?ga_debug=1 enables debug_mode for the whole session — events
            route to GA4 DebugView for testing instrumentation. Sticks via
            sessionStorage so same-tab navigation keeps it on. Real visitors
            without the param are unaffected. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());var __ifd=false;try{if(location.search.indexOf('ga_debug=1')!==-1){sessionStorage.setItem('if-ga-debug','1');}__ifd=sessionStorage.getItem('if-ga-debug')==='1';}catch(e){}gtag('config','G-98B24MRQZS',__ifd?{debug_mode:true}:undefined);`,
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
              creator: {
                '@type': 'Person',
                name: 'Brady Whitteker',
                sameAs: ['https://twitter.com/WhittekerBrady'],
              },
              sameAs: ['https://twitter.com/WhittekerBrady'],
            }),
          }}
        />
        {/* FAQPage schema — targets the queries our user actually types when
            they're stuck staring at their library. Each Q is a real-world
            phrasing of decision paralysis / backlog overload. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What game should I play?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "Inventory Full picks one game from your library based on your current mood and how much time you have. Import your Steam, Xbox, or PlayStation library, tell us how you feel and how long you've got, and we'll pick. One game. No browsing, no shortlists.",
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I decide what game to play next?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "Stop browsing your library. Pick two inputs — a mood and a session length — and let Inventory Full filter your collection down to one match. The only decision left is whether to start. If it's not the right pick, reroll.",
                  },
                },
                {
                  '@type': 'Question',
                  name: "I have too many games and can't decide. What do I do?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "That's exactly what Inventory Full is for. A library of 100+ games is the jam-wall problem from Iyengar's choice-overload research — more options means less action. We cut your library down to one pick so you can stop browsing and start playing.",
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is a pile of shame?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "It's gamer slang for the unplayed games piling up in your library — usually bought during sales or bundles. Inventory Full helps you actually play them by removing the decision paralysis that keeps you closing the launcher without picking anything.",
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is Inventory Full free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. No sign-up required, no ads, no tracking. Your library data stays on your device unless you opt into cloud sync.',
                  },
                },
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
