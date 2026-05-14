/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PlayStation backlog picker — Inventory Full',
  description:
    'Import your PlayStation library and get a mood-based game pick. PS Plus keeps adding to the pile — we help you actually play it.',
  alternates: {
    canonical: 'https://inventoryfull.gg/playstation-backlog-picker',
  },
  openGraph: {
    title: 'PlayStation backlog picker — Inventory Full',
    description:
      'Import your PlayStation library and get a mood-based game pick. PS Plus keeps adding to the pile — we help you actually play it.',
    url: 'https://inventoryfull.gg/playstation-backlog-picker',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlayStation backlog picker — Inventory Full',
    description:
      'Import your PlayStation library and get a mood-based game pick. PS Plus keeps adding to the pile — we help you actually play it.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'PlayStation backlog picker',
  description:
    'Import your PlayStation library and get a mood-based game pick. PS Plus keeps adding to the pile — we help you actually play it.',
  url: 'https://inventoryfull.gg/playstation-backlog-picker',
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

export default function PlayStationBacklogPickerPage() {
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
            PS Plus added 30 games this month. You played zero.
          </h1>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            PlayStation makes it easy to accumulate and hard to choose. Monthly PS Plus drops,
            seasonal sales, the Extra and Premium catalogs. You claimed them all because why
            wouldn't you. Now the library screen on your PS5 is a graveyard of good intentions.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The exclusives make it worse. You bought God of War because everyone said you had to.
            Same with Horizon, Spider-Man, Ghost of Tsushima. They're all sitting there, all 30+
            hour commitments, all staring at you from the home screen. Starting one means not
            starting the others, and that math never resolves.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            PlayStation doesn't have a built-in randomizer or picker. The store wants to sell you
            more. The home screen shows you what's new, not what you own. Nothing in the ecosystem
            is designed to help you play what's already there.
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
            Import your PlayStation library into Inventory Full. Tell it your mood and how long
            you've got. It picks one game from what you own. Not a list of ten. One.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Reroll if it doesn't land. Mark games completed when you finish them. Move on from the
            ones that aren't your thing. Both are progress.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Runs in your browser. No account needed. Works alongside Steam and Xbox imports if
            you're on multiple platforms.
          </p>

          <p
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)',
            }}
          >
            PS Plus keeps filling the library. Inventory Full helps you empty it.
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
              Import your PlayStation library
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
