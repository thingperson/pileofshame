/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Game backlog apps compared — Inventory Full',
  description:
    'Honest comparison of game backlog tools — trackers vs. pickers, what each one is good for, and where Inventory Full fits.',
  alternates: {
    canonical: 'https://inventoryfull.gg/alternatives',
  },
  openGraph: {
    title: 'Game backlog apps compared — Inventory Full',
    description:
      'Honest comparison of game backlog tools — trackers vs. pickers, what each one is good for, and where Inventory Full fits.',
    url: 'https://inventoryfull.gg/alternatives',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Game backlog apps compared — Inventory Full',
    description:
      'Honest comparison of game backlog tools — trackers vs. pickers, what each one is good for, and where Inventory Full fits.',
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Inventory Full compares to other backlog tools',
  description:
    'Honest comparison of game backlog tools — trackers vs. pickers, what each one is good for, and where Inventory Full fits.',
  url: 'https://inventoryfull.gg/alternatives',
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

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Backloggd',
      url: 'https://backloggd.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'GG App',
      url: 'https://www.gg.deals',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Grouvee',
      url: 'https://www.grouvee.com',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Infinite Backlog',
      url: 'https://www.infinitebacklog.net',
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'HowLongToBeat',
      url: 'https://howlongtobeat.com',
    },
    {
      '@type': 'ListItem',
      position: 6,
      name: 'Backlog Shuffle',
      url: 'https://www.backlogshuffle.com',
    },
    {
      '@type': 'ListItem',
      position: 7,
      name: 'Backlog Roulette',
      url: 'https://backlogroulette.com',
    },
    {
      '@type': 'ListItem',
      position: 8,
      name: 'MyBacklog',
      url: 'https://mybacklog.app',
    },
    {
      '@type': 'ListItem',
      position: 9,
      name: 'Steam Library Randomizer',
      url: 'https://store.steampowered.com',
    },
    {
      '@type': 'ListItem',
      position: 10,
      name: 'Inventory Full',
      url: 'https://inventoryfull.gg',
    },
  ],
};

const linkStyle = {
  color: 'var(--color-accent-purple)',
  textDecoration: 'underline' as const,
  textUnderlineOffset: '3px',
};

export default function AlternativesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <main
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          minHeight: '100vh',
        }}
      >
        {/* Nav */}
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

        {/* Article */}
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
            How Inventory Full compares to other backlog tools
          </h1>

          {/* Section 1 — Two categories */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Two different jobs
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The backlog tool space splits into trackers and pickers. Trackers help you catalogue what
            you've played. Pickers help you decide what to play next. Most tools are trackers.
            Inventory Full is a picker.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Both are useful. They solve different problems for different people. If you want a record
            of your gaming history that other people can see, a tracker is the right call. If you sit
            down to play, scroll for 20 minutes, and close the launcher without starting anything, a
            picker is.
          </p>

          {/* Section 2 — Trackers */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            The trackers
          </h2>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://backloggd.com" style={linkStyle}>
              Backloggd
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Social tracking platform, Goodreads-style. You rate, review, and log what you play, and
            there's a community layer around it. Good for people who want a library record others can
            see and interact with. If cataloguing with a social dimension is the job, Backloggd does
            that well.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://www.gg.deals" style={linkStyle}>
              GG App
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Tracks what you own across platforms, with deal alerts and price history. More oriented
            toward library management and value tracking than play decisions. Useful if you care about
            what you paid for things and want to know when prices drop.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://www.grouvee.com" style={linkStyle}>
              Grouvee
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Shelf-based tracking, similar to Backloggd but quieter. No heavy social layer. Solid if
            you want to log without the noise. The interface is simple and the shelves do what you'd
            expect.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://www.infinitebacklog.net" style={linkStyle}>
              Infinite Backlog
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Lightweight tracking focused on backlog management. Simple list, no ratings complexity.
            Good if you want something minimal that doesn't require much setup or maintenance.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://howlongtobeat.com" style={linkStyle}>
              HowLongToBeat
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Not a full tracker, but useful for planning if session length matters to you. It estimates
            how long games take to finish based on community-reported times. If you're trying to
            figure out whether a game fits your available time, it's worth checking.
          </p>

          {/* Section 3 — Pickers */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            The pickers
          </h2>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://www.backlogshuffle.com" style={linkStyle}>
              Backlog Shuffle
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Randomizes from your Steam library. Zero setup, fast. Works if random is genuinely fine
            with you. No mood or session-length filtering — it just picks something and you accept it
            or you don't.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://backlogroulette.com" style={linkStyle}>
              Backlog Roulette
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Similar to Backlog Shuffle, adds some filter options. Steam-focused. More control than a
            pure randomizer, still pretty lightweight. Good if you want a quick pick without much
            setup and Steam is your main platform.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            <a href="https://mybacklog.app" style={linkStyle}>
              MyBacklog
            </a>
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Cross-platform picker with more filter options. More setup than Inventory Full, more
            control if you want it. Worth looking at if you want to configure more of the picking
            logic yourself.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            Steam Library Randomizer
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Several browser extension variants exist. Zero setup — opens a random Steam game. No mood
            or time filtering. If you just want something fast and don't care what it picks, these
            work.
          </p>

          {/* Section 4 — Where Inventory Full fits */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Where Inventory Full fits
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            IF is a picker, not a tracker. The two inputs are mood and session length. One output:
            one game. Reroll if it's wrong.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The design premise: the problem most people have with their library isn't organizing it.
            It's committing to something. Adding more filters and sorting options makes that worse,
            not better. The full explanation of{' '}
            <Link href="/why-deciding-is-hard" style={linkStyle}>
              why choosing is so hard
            </Link>{' '}
            is its own page, but the short version is: more options produce more paralysis, not better
            decisions. Picking for you (based on what you already own, what mood you're in, and how
            much time you have) is the whole job.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Cross-platform imports pull from Steam, PlayStation, and Xbox. Guest mode works without
            an account. The app doesn't log your history, rate your taste, or show your library to
            anyone else.
          </p>

          <p
            style={{
              marginTop: '1.75rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            Who shouldn't use Inventory Full
          </p>
          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            People who want to log what they've played for their own records or for others to see. IF
            has no social layer, no ratings, no library view beyond the picker. If cataloguing is the
            job, Backloggd is better for that. If you want deal alerts and cross-platform price
            tracking, GG App is the one.
          </p>

          {/* Close */}
          <p
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)',
            }}
          >

            Trackers help you see what you own. Inventory Full helps you play it.
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
              Try Inventory Full. It&apos;s free.
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
