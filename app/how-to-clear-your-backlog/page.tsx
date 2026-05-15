/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to actually clear your gaming backlog — Inventory Full',
  description:
    "Spreadsheets and tier lists won't fix your backlog. The problem is deciding, not organizing. Five strategies grounded in behavioral science, plus a tool that does the deciding for you.",
  alternates: {
    canonical: 'https://inventoryfull.gg/how-to-clear-your-backlog',
  },
  openGraph: {
    title: 'How to actually clear your gaming backlog — Inventory Full',
    description:
      "Spreadsheets and tier lists won't fix your backlog. The problem is deciding, not organizing. Five strategies grounded in behavioral science, plus a tool that does the deciding for you.",
    url: 'https://inventoryfull.gg/how-to-clear-your-backlog',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to actually clear your gaming backlog — Inventory Full',
    description:
      "Spreadsheets and tier lists won't fix your backlog. The problem is deciding, not organizing. Five strategies grounded in behavioral science, plus a tool that does the deciding for you.",
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to actually clear your gaming backlog',
  description:
    "Spreadsheets and tier lists won't fix your backlog. The problem is deciding, not organizing. Five strategies grounded in behavioral science, plus a tool that does the deciding for you.",
  url: 'https://inventoryfull.gg/how-to-clear-your-backlog',
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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I reduce my gaming backlog?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Stop organizing and start deciding. Pick games by mood and available time, not by browsing your whole library. Give each game a 20-minute audition. If it hooks you, keep going. If it doesn't, move on without guilt. Moving on counts as clearing. The backlog shrinks from decisions, not from completions.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is it OK to not finish a game?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Moving on from a game is a decision, not a failure. You evaluated it and decided it's not for you right now. That frees up mental space and real time for a game that is. A backlog full of evaluated-and-dismissed games is smaller and lighter than one full of games you're avoiding.",
      },
    },
  ],
};

const linkStyle = {
  color: 'var(--color-accent-purple)',
  textDecoration: 'underline' as const,
  textUnderlineOffset: '3px',
};

export default function HowToClearYourBacklogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
            How to actually clear your gaming backlog
          </h1>

          {/* Section 1 — Why the usual advice fails */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            The advice you've already tried
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Make a list. Prioritize by Metacritic score. Sort by length using HowLongToBeat. Create a
            spreadsheet with columns for genre, estimated hours, and a "want to play" rating. Build a
            tier list. Post it on Reddit for feedback.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            You've done some version of this. Maybe all of it. And the next time you sat down to
            play, you scrolled past the list and opened YouTube anyway.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            That's because organizing a backlog and clearing a backlog are two completely different
            activities. Organizing feels productive. It gives you a sense of control. But it doesn't
            reduce the number of decisions you need to make at play time. A perfectly sorted list of
            200 games is still 200 games. The{' '}
            <Link href="/why-deciding-is-hard" style={linkStyle}>
              research on choice overload
            </Link>{' '}
            is clear on this: more visible options produce more paralysis, regardless of how well
            they're organized.
          </p>

          {/* Section 2 — The reframe */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Clearing is deciding, not completing
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Here's the reframe that makes everything else work: your backlog doesn't shrink when you
            finish games. It shrinks when you make decisions about games. Finishing is one kind of
            decision. Moving on is another. Both reduce the pile. Both count.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            A game you tried for 20 minutes and decided wasn't for you is no longer an open loop. It's
            resolved. A game you played for 30 hours and loved is resolved. A game you've been
            avoiding for three years because you feel guilty about the $60? Still open. Still weighing
            on you every time you scroll past it.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The backlog isn't a to-do list. It's a decision queue. Clear the decisions and the
            backlog follows.
          </p>

          {/* Section 3 — Five strategies */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Five strategies that work
          </h2>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            1. Pick by mood, not by title
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            When you stare at a list of game titles, your brain tries to evaluate each one. That's
            the paralysis. Instead, skip the library entirely and start with one question: what do I
            want to feel right now? Tense, chill, competitive, immersed, mindless? Mood narrows the
            field before you see a single title. The game follows from the mood, not the other way
            around.
          </p>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            2. The 20-minute audition
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            A big reason backlogs grow is commitment fear. Starting a new game feels like signing up
            for 40 hours. So don't. Give any game exactly 20 minutes. That's the audition. If
            it grabs you, great. If it doesn't, that's data. Either outcome shrinks the pile.
          </p>

          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            The 20-minute frame also handles the sunk-cost problem. That $60 game you bought in 2022?
            Give it 20 minutes. Now you know. The alternative, leaving it in "someday" forever,
            means it never stops costing you mental space.
          </p>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            3. Moving on is clearing
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            This one's hard for completionists. But moving on from a game is a real decision with
            real value. It means you evaluated something, decided it's not right for you, and freed
            up a slot for something that might be. The backlog shrinks the same amount whether you
            roll credits or put the controller down at hour two.
          </p>

          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            Not every game deserves 40 hours of your life. Some of them were impulse buys during a
            sale. Some of them are genuinely good but not for you. Acknowledging that isn't failure.
            It's the most efficient thing you can do for the pile.
          </p>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            4. Alternate short and long
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            Long games stall backlogs. You play 80 hours of an RPG, finish it, and then stare at the
            pile again. Momentum dies. The fix: after every long game, clear a short one. A 3-hour
            indie. A 90-minute walking sim. Something you can finish in a single session. The
            completion builds momentum. Research on small wins shows they compound: people who
            experience a quick success are more likely to tackle the next thing.
          </p>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            5. Stop browsing your whole library
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            This is the meta-strategy. Every time you open your full library and scroll, you're
            resetting the{' '}
            <Link href="/cant-decide-what-to-play" style={linkStyle}>
              decision paralysis loop
            </Link>
            . The fewer games you see at decision time, the faster you pick. Maintain a short list
            of 3-5 "up next" games. When you sit down to play, look at that list, not the whole
            library. Refill it when it's empty. But never browse 200 games at play time. That's how
            you end up on YouTube.
          </p>

          {/* Section 4 — Product tie-in */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Tools that help (and one we built)
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            These strategies work on their own. Some people do fine with a sticky note on their
            monitor. But if you want something that automates the first three strategies at once:{' '}
            <Link href="/" style={linkStyle}>
              Inventory Full
            </Link>{' '}
            imports your library from{' '}
            <Link href="/steam-backlog-picker" style={linkStyle}>
              Steam
            </Link>
            ,{' '}
            <Link href="/xbox-backlog-picker" style={linkStyle}>
              Xbox
            </Link>
            , or{' '}
            <Link href="/playstation-backlog-picker" style={linkStyle}>
              PlayStation
            </Link>
            . Two inputs: mood and session length. One output: one game. Reroll if it's wrong, move
            on if it's not for you. The app treats moved-on games the same as completed ones. Both
            are progress.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            If you want to{' '}
            <Link href="/alternatives" style={linkStyle}>
              compare it to other backlog tools
            </Link>
            , we wrote that up too. Different tools solve different problems. If your problem is
            choosing, not cataloguing, this is the one built for that.
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
            The backlog isn't going anywhere. But tonight, one game in it could.
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
              Start clearing
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
