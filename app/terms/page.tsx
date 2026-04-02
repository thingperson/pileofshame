import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Inventory Full',
  description: 'The rules. They are short and reasonable.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm text-text-dim hover:text-accent-purple transition-colors mb-8 inline-block"
        >
          &larr; Back to app
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-text-dim font-[family-name:var(--font-mono)] mb-8">
          Last updated: April 2, 2026
        </p>

        <div className="space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">The short version</h2>
            <p>
              Inventory Full is a free gaming backlog tool. Use it to track your games, figure out
              what to play, and feel good about actually playing them. Don&apos;t abuse it, and
              we&apos;ll keep making it better.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">1. What the app does</h2>
            <p>
              Inventory Full helps you manage your gaming backlog. You can import games from Steam,
              PlayStation, and Xbox, track your progress, get mood-based game recommendations, and
              see stats about your library. The app is provided &ldquo;as is&rdquo; and is free
              to use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">2. Your account</h2>
            <p>
              You can use the app without an account. Everything works locally in your browser.
              If you create an account for cloud sync, you&apos;re responsible for keeping your
              login credentials secure. We use Supabase for authentication.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">3. Your data</h2>
            <p>
              Your game library data belongs to you. We don&apos;t claim ownership of any content
              you add (notes, ratings, shelves). You can export your data at any time using the
              Export Backup feature. See our{' '}
              <Link href="/privacy" className="text-accent-purple hover:underline">
                Privacy Policy
              </Link>{' '}
              for details on how we handle data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">4. Game data and third parties</h2>
            <p>
              Game metadata (descriptions, images, prices, completion times) comes from third-party
              APIs including RAWG, IsThereAnyDeal, HowLongToBeat, Steam, and PlayStation Network. This
              data is provided by those services and may change. We don&apos;t guarantee its accuracy.
            </p>
            <p className="mt-2">
              Game cover art, logos, and descriptions are the property of their respective publishers
              and developers. We display them under fair use for the purpose of helping you manage
              your personal game library.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">5. Affiliate links</h2>
            <p>
              Some game deal links may include affiliate parameters. If you purchase through these
              links, we may earn a small commission. We always show the actual price — we never
              inflate or misrepresent pricing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">6. Acceptable use</h2>
            <p>Don&apos;t:</p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted mt-2">
              <li>Abuse the API endpoints (rate limiting is in place)</li>
              <li>Attempt to access other users&apos; data</li>
              <li>Use automated tools to scrape the service</li>
              <li>Misrepresent yourself or impersonate others</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">7. Availability and changes</h2>
            <p>
              We aim to keep the app running and improving, but we can&apos;t guarantee 100% uptime.
              Features may change, be added, or be removed. We&apos;ll try to communicate significant
              changes, but this is a passion project and things evolve.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">8. Limitation of liability</h2>
            <p>
              Inventory Full is provided &ldquo;as is&rdquo; without warranties of any kind. We&apos;re
              not liable for any data loss (always use the Export Backup feature), inaccurate game
              data from third parties, or any decisions you make based on the app&apos;s recommendations.
            </p>
            <p className="mt-2">
              The &ldquo;library value&rdquo; calculations are estimates based on available pricing
              data and should not be considered financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">9. Intellectual property</h2>
            <p>
              The Inventory Full app, its design, code, and original content are our intellectual
              property. The themes, UI patterns, and brand identity are part of what makes this
              app unique. Please don&apos;t clone it wholesale.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">10. Changes to these terms</h2>
            <p>
              We may update these terms occasionally. The date at the top will reflect the latest
              revision. Continued use of the app after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Contact</h2>
            <p>
              Questions?{' '}
              <a href="mailto:hello@inventoryfull.gg" className="text-accent-purple hover:underline">
                hello@inventoryfull.gg
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle">
          <Link
            href="/privacy"
            className="text-sm text-text-dim hover:text-accent-purple transition-colors"
          >
            Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
