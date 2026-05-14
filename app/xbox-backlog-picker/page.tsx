/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Xbox backlog picker — Inventory Full',
  description:
    'Import your Xbox library and Game Pass catalog, then get a mood-based pick. Stop browsing rows of tiles and start playing.',
  alternates: {
    canonical: 'https://inventoryfull.gg/xbox-backlog-picker',
  },
  openGraph: {
    title: 'Xbox backlog picker — Inventory Full',
    description:
      'Import your Xbox library and Game Pass catalog, then get a mood-based pick. Stop browsing rows of tiles and start playing.',
    url: 'https://inventoryfull.gg/xbox-backlog-picker',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xbox backlog picker — Inventory Full',
    description:
      'Import your Xbox library and Game Pass catalog, then get a mood-based pick. Stop browsing rows of tiles and start playing.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Xbox backlog picker',
  description:
    'Import your Xbox library and Game Pass catalog, then get a mood-based pick. Stop browsing rows of tiles and start playing.',
  url: 'https://inventoryfull.gg/xbox-backlog-picker',
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

export default function XboxBacklogPickerPage() {
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
            Game Pass gave you 400 games. Now what?
          </h1>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Game Pass is the best deal in gaming and the worst thing that ever happened to your
            ability to pick something. Hundreds of games, all available right now, new ones every
            month, some leaving soon. The dashboard is rows of tiles stretching forever.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            You scroll through them. Something catches your eye but you're not sure if it's your
            kind of thing. You keep scrolling. Twenty minutes later you've looked at fifty games and
            started none of them.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Add in the games you actually bought, the Games with Gold backlog, and the stuff
            from previous generations sitting in backward compatibility. Your Xbox library isn't a
            collection anymore. It's a wall.
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
            Connect your Xbox profile. Inventory Full pulls your owned games and can include Game
            Pass titles too. Tell it your mood and how much time you have. It picks one game.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Not feeling it? Reroll. Done with something? Mark it completed or move on. The app
            doesn't care which. Both count as progress.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Works in your browser, no app install. No account required. Your data stays on your
            device.
          </p>

          <p
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Game Pass keeps adding games. Inventory Full helps you play them.
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
              Import your Xbox library
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
