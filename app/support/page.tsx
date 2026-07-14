import Link from 'next/link';

export const metadata = {
  title: 'Support | Inventory Full',
  description: 'Get help with Inventory Full, on the web or iOS.',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm text-text-dim hover:text-accent-purple transition-colors mb-8 inline-block"
        >
          &larr; Back to app
        </Link>

        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-sm text-text-dim font-[family-name:var(--font-mono)] mb-8">
          Web app and iOS app, same team, same address.
        </p>

        <div className="space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Contact us</h2>
            <p>
              Email{' '}
              <a href="mailto:hello@inventoryfull.gg" className="text-accent-purple hover:underline">
                hello@inventoryfull.gg
              </a>{' '}
              for anything &mdash; bugs, questions, feature requests, or just to say hi. We read
              every message and reply ourselves.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Common questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  How do I delete my account and data?
                </h3>
                <p>
                  Email{' '}
                  <a href="mailto:privacy@inventoryfull.gg" className="text-accent-purple hover:underline">
                    privacy@inventoryfull.gg
                  </a>{' '}
                  from the address on your account and we&apos;ll delete your account and all
                  associated data (library, sync history, preferences) within 30 days. Deletion is
                  permanent &mdash; export a backup first if you want to keep a copy.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  How does sync work between web and iOS?
                </h3>
                <p>
                  Both apps read and write the same library through your account. Sign in with the
                  same email (or the same Google/Discord account) on both, and changes made on one
                  show up on the other. You don&apos;t need an account at all to use either app
                  locally &mdash; sync is opt-in.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  I found a bug. What should I include?
                </h3>
                <p>
                  Whether you were on web or iOS, roughly what you were doing, and what you expected
                  to happen instead. Screenshots help. We&apos;ll follow up if we need more.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  Where&apos;s the privacy policy / terms of service?
                </h3>
                <p>
                  <Link href="/privacy" className="text-accent-purple hover:underline">Privacy Policy</Link>
                  {' '}&middot;{' '}
                  <Link href="/terms" className="text-accent-purple hover:underline">Terms of Service</Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
