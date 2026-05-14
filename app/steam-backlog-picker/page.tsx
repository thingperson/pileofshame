/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Steam backlog picker — Inventory Full',
  description:
    'Import your Steam library and get a mood-based game pick in seconds. No spreadsheets, no sorting, no scrolling past 300 games you already own.',
  alternates: {
    canonical: 'https://inventoryfull.gg/steam-backlog-picker',
  },
  openGraph: {
    title: 'Steam backlog picker — Inventory Full',
    description:
      'Import your Steam library and get a mood-based game pick in seconds. No spreadsheets, no sorting, no scrolling past 300 games you already own.',
    url: 'https://inventoryfull.gg/steam-backlog-picker',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steam backlog picker — Inventory Full',
    description:
      'Import your Steam library and get a mood-based game pick in seconds. No spreadsheets, no sorting, no scrolling past 300 games you already own.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Steam backlog picker',
  description:
    'Import your Steam library and get a mood-based game pick in seconds. No spreadsheets, no sorting, no scrolling past 300 games you already own.',
  url: 'https://inventoryfull.gg/steam-backlog-picker',
  author: {
    '@type': 'Organization',
    name: 'Inventory Full',
    url: 'https://inventoryfull.gg',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Inventory Full',
    url: 'https://inventoryfull.gg',
  },
};

export default function SteamBacklogPickerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          minHeight: '100vh',
        }}
      >
        <nav
          style={{
            maxWidth: '42rem',
            margin: '0 auto',
            padding: '2rem 1.5rem 0',
          }}
        >
          <Link
            href="/"
            style={{
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              letterSpacing: '0.01em',
            }}
          >
            ← inventoryfull.gg
          </Link>
        </nav>

        <article
          style={{
            maxWidth: '42rem',
            margin: '0 auto',
            padding: '3rem 1.5rem 6rem',
            lineHeight: '1.75',
            fontSize: '1.0625rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '2.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Your Steam library has 300 games. Pick one.
          </h1>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            You know the routine. Open Steam. Scroll the library. Hover over something. Think about
            it. Scroll more. Close Steam. Watch YouTube instead.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The library grew because the sales were good. Summer Sale, Winter Sale, a Humble Bundle
            here, a 90%-off impulse buy there. Every one of those games looked right at the time.
            Now they sit in a list so long you can't even remember what half of them are.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The problem isn't that you don't have anything to play. It's that you have too much.
            Randomizers exist for Steam, but random doesn't help when the issue is commitment, not
            discovery. Getting handed a game you bought in 2019 and forgot about doesn't make you
            want to play it.
          </p>

          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            How it works
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Paste your Steam ID. Inventory Full imports your library in seconds. Tell it your mood
            and how long you want to play. It picks one game. Not a list. One.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            If the pick isn't right, reroll. If you're done with a game for good, move on. No guilt,
            no shame. The app tracks what you're playing, what you've finished, and what you've
            decided isn't for you. That's it.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            No account required. Everything runs in your browser. Your library stays yours.
          </p>

          <p
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)',
            }}
          >
            You already own the games. Inventory Full helps you play them.
          </p>
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-cyan)',
                color: 'var(--color-bg-primary)',
                fontWeight: 700,
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              Import your Steam library
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
