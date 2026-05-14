/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why deciding what to play is so hard — Inventory Full',
  description:
    "Your gaming backlog isn’t a logistics problem. It’s an identity problem. Here’s the psychology behind the scroll-and-close pattern, and what actually helps.",
  alternates: {
    canonical: 'https://inventoryfull.gg/why-deciding-is-hard',
  },
  openGraph: {
    title: 'Why deciding what to play is so hard — Inventory Full',
    description:
      "Your gaming backlog isn't a logistics problem. It's an identity problem. Here's the psychology behind the scroll-and-close pattern, and what actually helps.",
    url: 'https://inventoryfull.gg/why-deciding-is-hard',
    siteName: 'Inventory Full',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why deciding what to play is so hard — Inventory Full',
    description:
      "Your gaming backlog isn't a logistics problem. It's an identity problem. Here's the psychology behind the scroll-and-close pattern, and what actually helps.",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Why deciding what to play is so hard',
  description:
    "Your gaming backlog isn't a logistics problem. It's an identity problem. Here's the psychology behind the scroll-and-close pattern, and what actually helps.",
  url: 'https://inventoryfull.gg/why-deciding-is-hard',
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

export default function WhyDecidingIsHardPage() {
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
            Why deciding what to play is so hard
          </h1>

          {/* Section 1 — The pattern */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            You already know this feeling
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            You open Steam. You scroll. You hover over something and some part of your brain says{' '}
            <em>not that one</em>. You can't say why. So you scroll more. You
            remember you also have games on Xbox, so you open that. You scroll there too. Twenty
            minutes pass. You open YouTube. You watch someone else play a game. You go to bed without
            having played anything.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Sound familiar? Good. Because this isn't about you specifically.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            This pattern happens to people with meticulously organized libraries. People with color-coded
            spreadsheets and "up next" queues and HLTB estimates next to every title. The organization
            doesn't solve it. More options make it worse. A bigger sale, a new Game Pass drop. Same problem. There's a structural reason this keeps happening. Once you understand it, the
            scroll-and-close loop stops feeling like a personal failing and starts feeling like the
            completely predictable output it actually is.
          </p>

          {/* Pip — exhausted from the scroll-and-close loop */}
          <div style={{ textAlign: 'center', margin: '2rem 0 1.5rem' }}>
            <img
              src="/landing/pip/pip-exhausted.webp"
              alt=""
              width={120}
              height={120}
              style={{ display: 'inline-block', opacity: 0.88 }}
            />
          </div>

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
            Backlogs aren't to-do lists
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            To-do items have right answers. Email your accountant. Pick up milk. Those are tasks.
            They resolve. A game library is something else entirely. It's an archive of possible
            versions of yourself.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Every unplayed game in that library is an identity claim you made. Usually at 2am during
            a sale, maybe on a friend's recommendation, maybe after watching a review that made the
            game look transformative. You weren't buying a product. You were buying a future self. The
            person who finally plays <em>Disco Elysium</em>. The person who gets deep into{' '}
            <em>Dwarf Fortress</em>. The person who actually finishes a 60-hour RPG for once.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            When you scroll your library at 9pm on a Wednesday, you are not choosing a game. You are
            choosing a self for the evening. Which version of you has the next 60 hours? Which one
            isn't going to feel guilty about replaying something comfortable instead of tackling the
            backlog? Which one is ready to commit to a story that might not pay off until hour 12?
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            That's why it feels heavy. Because it <em>is</em> heavy. Every scroll is a small identity
            decision wearing a leisure outfit.
          </p>

          {/* Section 3 — The psychology */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            The behavioral science (it's not personal)
          </h2>

          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            The scroll-and-close pattern has a name in the research literature. Several, actually.
            This isn't a character flaw. It's documented human behavior under specific conditions. Conditions your game library manufactures at scale.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            Choice overload
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Iyengar and Lepper ran a now-famous experiment in 2000: shoppers shown 24 varieties of jam
            were about 10 times less likely to buy anything than shoppers shown just 6. More options
            produced less action and worse feelings about the eventual choice. Your 400-game library is
            the 24-jam table. Better organization doesn't solve choice overload. Fewer choices does.
            The problem isn't that your library is messy. It's that it's enormous.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            The paradox of choice
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Barry Schwartz documented something that compounds the jam problem: too many options
            produce regret even after you decide. You pick a game. Part of your brain immediately
            catalogs everything you didn't pick. Post-decision regret before the save file loads.
            This is why even when you do commit to something, 45 minutes in you're wondering if you
            should be playing something else. It's not the game's fault. It's the size of the
            alternative set.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            Loss aversion
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Kahneman and Tversky showed that losses loom about twice as large as equivalent gains feel
            good. A new game is a 20-to-60-hour commitment. If it doesn't land, if it turns out not
            to be your thing after 8 hours, that's a real perceived loss. So your brain delays. It
            scrolls. It opens YouTube. It makes the decision feel lower-stakes by never quite making
            it.
          </p>

          <p
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}
          >
            Sunk cost and the weight of the unplayed
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            The $60 game you bought four years ago has weight. Not starting it already felt like a
            small mistake. Starting it now and not liking it confirms that. Better to leave it in the
            "I'll get to it" column where the loss is still theoretical. It's not avoidance. It's
            your brain protecting a story about a future self that hasn't failed yet.
          </p>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            These are not character flaws. They are documented, predictable features of human
            decision-making under conditions of abundance and uncertainty. The scroll-and-close pattern
            is the expected output when you combine all four.
          </p>

          {/* Pip — pointing toward solutions */}
          <div style={{ textAlign: 'center', margin: '2rem 0 1.5rem' }}>
            <img
              src="/landing/pip/pip-pointing.webp"
              alt=""
              width={120}
              height={120}
              style={{ display: 'inline-block', opacity: 0.88 }}
            />
          </div>

          {/* Section 4 — What actually helps */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            What actually helps
          </h2>

          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Four things. None of them are "organize your library better."
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
            1. Constrain the field
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            The jam study solution wasn't better jam. It was fewer jam. Pick a mood. Tense, chill,
            whatever. Pick a session length. 20 minutes or an evening. Let those two things collapse
            400 options down to something manageable. Then pick the first thing that doesn't
            immediately feel wrong. You're not finding the perfect game. You're breaking the decision
            paralysis.
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
            2. Decide on mood, not game
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            You can't reliably predict which 40-hour RPG will be worth your Tuesday night. You can
            know whether you want something intense or something you can zone out to. Decide there
            first. The game follows from the mood. Much easier decision. And it turns out it's sufficient.
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
            3. Time-box the audition
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            The fear is commitment. So don't commit. Give any game 20 minutes. That's an audition,
            not a marriage. If it hooks you, keep going. If it doesn't, it gets the same status as
            a game you beat: a decision made. Something evaluated and accounted for. The pile gets
            smaller either way.
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
            4. Treat quitting as a decision
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
            Moving on is not failure. You decided that game isn't the right one for you right now. Or maybe ever. That's information. That freed up mental space and real time for one that
            is. Not a pile of shame. A list of options you've evaluated. The ones that are still
            sitting there? You just haven't auditioned them yet.
          </p>

          {/* Section 5 — Inventory Full */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Why this app exists
          </h2>

          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            This thinking is also why{' '}
            <a
              href="https://inventoryfull.gg"
              style={{
                color: 'var(--color-accent-purple)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Inventory Full
            </a>{' '}
            exists. It takes your actual library, asks two questions (mood and session length), and
            gives one answer. No browsing 400 options. No shortlist to second-guess yourself on. One
            game, picked from what you already own. Whether you use it or not: the backlog problem is
            a decision problem. The fix is reducing choices, not optimizing them.
          </p>

          {/* Close */}
          <p
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
            }}
          >
            Your library isn't a ledger of failures. It's a list of options you haven't picked yet.
            Some of them might never be the right version of you to pick. That's fine. The one that
            is? It's in there.
          </p>
        </article>
      </main>
    </>
  );
}
