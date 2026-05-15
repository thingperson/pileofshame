/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Can't decide what to play? Here's why — Inventory Full",
  description:
    "You have 200 games and you're watching YouTube. The scroll-and-close loop is a documented psychological pattern, not a personal failing. Here's what actually breaks it.",
  alternates: {
    canonical: 'https://inventoryfull.gg/cant-decide-what-to-play',
  },
  openGraph: {
    title: "Can't decide what to play? Here's why — Inventory Full",
    description:
      "You have 200 games and you're watching YouTube. The scroll-and-close loop is a documented psychological pattern, not a personal failing. Here's what actually breaks it.",
    url: 'https://inventoryfull.gg/cant-decide-what-to-play',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Can't decide what to play? Here's why — Inventory Full",
    description:
      "You have 200 games and you're watching YouTube. The scroll-and-close loop is a documented psychological pattern, not a personal failing. Here's what actually breaks it.",
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "Can't decide what to play? Here's why, and what to do about it.",
  description:
    "You have 200 games and you're watching YouTube. The scroll-and-close loop is a documented psychological pattern, not a personal failing. Here's what actually breaks it.",
  url: 'https://inventoryfull.gg/cant-decide-what-to-play',
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
      name: "Why can't I decide what game to play?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Large game libraries trigger choice overload, a documented psychological effect where too many options lead to decision paralysis. When you scroll through hundreds of games, each one demands a small evaluation. Your brain runs out of decision energy before you pick anything. It's not laziness. It's a predictable response to having too many good options.",
      },
    },
    {
      '@type': 'Question',
      name: 'How do I pick a game to play tonight?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Start with your mood, not your library. Ask yourself one question: do I want something intense or something I can zone out to? Then pick a session length: 20 minutes, an hour, or a full evening. Those two constraints collapse hundreds of options into a manageable few. Pick the first one that doesn't feel wrong. You're breaking paralysis, not finding the perfect game.",
      },
    },
    {
      '@type': 'Question',
      name: 'What should I play when I have too many games?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The counterintuitive answer: stop looking at all of them. The research on choice overload shows that reducing visible options improves both the decision and your satisfaction with it. Filter by mood and available time, ignore everything else, and commit to a 20-minute audition. If it hooks you, keep going. If not, move on without guilt. That's progress.",
      },
    },
  ],
};

const linkStyle = {
  color: 'var(--color-accent-purple)',
  textDecoration: 'underline' as const,
  textUnderlineOffset: '3px',
};

export default function CantDecideWhatToPlayPage() {
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
            Can't decide what to play? Here's why, and what to do about it.
          </h1>

          {/* Section 1 — Recognition */}
          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            You sat down to play something. You opened your library. You scrolled. You hovered over a
            few things. Nothing felt right. You opened a different launcher. Same scroll, same
            nothing. Thirty minutes later you're watching someone else play a game on YouTube and
            you're not sure how you got here.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            This happens to people with 50 games. It happens to people with 500. It happens to people
            with beautifully organized libraries and carefully maintained wishlists. Organization
            doesn't solve it. Neither does adding more games.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            If this is you, you don't have a willpower problem. You have a choice architecture
            problem. And it's one of the most documented patterns in behavioral psychology.
          </p>

          {/* Section 2 — Quick psychology */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Why this happens
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            In 2000, researchers ran an experiment with jam samples in a grocery store. Shoppers who
            saw 24 options were about ten times less likely to buy any jam than shoppers who saw 6.
            More options, less action. That was the finding that launched an entire field of research
            into what psychologists call choice overload.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Your game library is the 24-jam table. Every title in the scroll is a small evaluation
            your brain has to make. Is this the right genre for tonight? Am I in the mood for
            something this long? Will I regret not playing the other thing? Each evaluation costs
            decision energy. By the time you've scrolled past thirty games, you're tapped out. YouTube
            is easier because it asks nothing of you.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Then there's loss aversion. Starting a 40-hour game is a commitment. What if it doesn't
            click by hour three? That's hours you could've spent on the one that would've clicked.
            Your brain calculates this without telling you, and the result is the same every time:
            delay. Scroll more. Decide later. Close the launcher.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            The full research breakdown is on{' '}
            <Link href="/why-deciding-is-hard" style={linkStyle}>
              its own page
            </Link>
            . The short version: you're not indecisive. You have too many options and no good
            framework for narrowing them.
          </p>

          {/* Section 3 — What works */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Three things that actually break it
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
            1. Decide on mood, not game
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            You cannot reliably predict which specific game will be worth your Tuesday night. You can
            know whether you want something tense or something you can zone out to. Start there.
            Mood is an easier question than title, and it filters out 80% of your library instantly.
            The game follows from the mood.
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
            2. Set a session length
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            "How long do I have?" is the second filter. Twenty minutes? You're not starting a JRPG.
            Full evening? Something you can sink into. These two questions together, mood and session
            length, collapse a library of hundreds into a handful. That's the whole trick. The
            paralysis lives in the gap between "everything" and "something specific." Close the gap.
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
            3. Treat the audition as the commitment
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            Give any game 20 minutes. That's the audition. If it hooks you, keep going. If it
            doesn't, you didn't fail. You made a decision. The game goes into "Moved On" and your
            library gets smaller. Moving on is progress. It means you evaluated something and decided
            it's not for you right now. That's one fewer option weighing on the next scroll.
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
            Or let something else decide
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Everything above works whether you use a tool or not. But if you want to skip the
            filtering and just get an answer:{' '}
            <Link href="/" style={linkStyle}>
              Inventory Full
            </Link>{' '}
            imports your library from Steam, Xbox, or PlayStation. You tell it your mood and session
            length. It picks one game. Not a list, not a shortlist, not a set of rows to browse. One
            game. Reroll if it's wrong.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            No account required. Runs in your browser. Your data stays on your device. The goal is
            getting you from "I want to play something" to actually playing in under a minute. If
            you're curious how it{' '}
            <Link href="/alternatives" style={linkStyle}>
              compares to other backlog tools
            </Link>
            , that's its own page.
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
            The games are already there. The hard part was always picking one.
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
              Pick my game
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
