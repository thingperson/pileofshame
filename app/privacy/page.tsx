import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Inventory Full',
  description: 'How we handle your data. Short version: we keep it minimal.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm text-text-dim hover:text-accent-purple transition-colors mb-8 inline-block"
        >
          &larr; Back to app
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-dim font-[family-name:var(--font-mono)] mb-8">
          Last updated: April 4, 2026
        </p>

        <div className="space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">The short version</h2>
            <p>
              We collect the minimum data needed to make the app work. We don&apos;t sell your data
              and we don&apos;t track you across the web. We use Google Analytics to understand general
              usage patterns, but we don&apos;t use that data to identify you or build ad profiles.
              Your game library data stays in your browser unless you explicitly opt into cloud sync.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">What we collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you use the app without an account</h3>
                <p>
                  Nothing leaves your device. Your entire game library, settings, and preferences are
                  stored in your browser&apos;s localStorage. We have no access to it. If you clear your
                  browser data, it&apos;s gone.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you create an account (cloud sync)</h3>
                <p>
                  We store your email address and your synced game library data via Supabase (our
                  authentication and database provider). This enables cloud sync across devices.
                  Supabase&apos;s privacy practices are governed by their own{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline">
                    privacy policy
                  </a>.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you import from Steam</h3>
                <p>
                  We use the Steam Web API to fetch your public game list, playtime, and achievement data.
                  Your Steam ID is sent to our server to make the API call, but we do not store your Steam
                  credentials. The imported data is stored in your browser&apos;s localStorage (or in your
                  synced account if you&apos;re signed in).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you import from PlayStation</h3>
                <p>
                  You provide a PSN authentication token (npsso) which we use ephemerally to fetch your
                  trophy and game data. The token is sent to our server for the API call but is not
                  stored, logged, or retained after the request completes. Your trophy data is stored
                  locally in your browser.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you import from Xbox</h3>
                <p>
                  We use the OpenXBL API to fetch your game list and achievement data using your Xbox
                  gamertag or XUID. Your gamertag is sent to our server for the API call but is not
                  stored beyond what is saved in your local game library. The imported data is stored
                  in your browser&apos;s localStorage (or in your synced account if you&apos;re signed in).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Third-party services we use</h2>
            <p className="mb-3">
              To enrich your game data with descriptions, artwork, pricing, and completion times,
              we make API calls to the following services using game names (not your personal data):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li><strong>RAWG API</strong>: game metadata, descriptions, genres, screenshots</li>
              <li><strong>IsThereAnyDeal API</strong>: current game prices and deals across stores</li>
              <li><strong>HowLongToBeat</strong>: estimated completion times</li>
              <li><strong>Steam Web API</strong>: game library, playtime, achievements (when importing)</li>
              <li><strong>Supabase</strong>: authentication and cloud sync (when signed in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Affiliate links</h2>
            <p>
              When we show game deals via IsThereAnyDeal, some links may include affiliate parameters.
              If you purchase a game through one of these links, we may receive a small commission at
              no extra cost to you. This is how we keep the app free.
            </p>
            <p className="mt-2">
              We never recommend games to buy. We only show deals on games you already own or have
              wishlisted yourself. Our goal is to help you play what you have, not sell you more.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Cookies and tracking</h2>
            <p>
              We use Google Analytics to understand how people use the app (page views, feature usage,
              general traffic patterns). Google Analytics may set cookies to distinguish users. We do
              not use this data to identify individuals or build advertising profiles. We do not use
              pixel trackers, fingerprinting, or any form of cross-site tracking.
            </p>
            <p className="mt-2">
              We use localStorage (a browser storage mechanism) to save your app state locally.
              This is not a cookie and cannot be used for tracking.
            </p>
            <p className="mt-2">
              When you click deal links to third-party stores, those sites may set their own cookies
              for affiliate tracking and purchase attribution. We have no control over those cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Data storage and retention</h2>
            <p>
              Without an account: your data lives in your browser only. You control it entirely.
              Clear your browser data and it&apos;s gone.
            </p>
            <p className="mt-2">
              With an account: your synced library data is stored in Supabase&apos;s infrastructure.
              You can delete your account and all associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Your rights</h2>
            <p>
              Under applicable privacy laws (including CCPA, CPRA, and PIPEDA), you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted mt-2">
              <li><strong>Access</strong>: Export your data at any time using the Export Backup feature</li>
              <li><strong>Delete</strong>: Clear your local data via browser settings, or request full
                deletion of your account and all cloud-synced data by emailing us</li>
              <li><strong>Portability</strong>: Your exported data is a standard JSON file you can take anywhere</li>
              <li><strong>Opt out</strong>: Use the app without creating an account (all features work locally,
                no data leaves your device)</li>
              <li><strong>Know</strong>: This policy describes all data we collect and how we use it.
                If you have questions, ask us</li>
            </ul>
            <p className="mt-3">
              We respond to data deletion requests within 30 days. When we delete your account,
              we delete everything: your email, your library data, your sync history, and any
              associated metadata. We do not retain anonymized copies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Personalized recommendations and profiling</h2>
            <p>
              Our &ldquo;What Should I Play?&rdquo; feature uses algorithmic matching based on your
              selected mood, available time, and game metadata to suggest games from your own library.
              No AI models are used. No personal data is sent to external AI services. The matching
              happens entirely in your browser.
            </p>
            <p className="mt-2">
              We also analyze your library data (games owned, completion status, play hours, genres)
              to generate a &ldquo;Player Archetype&rdquo; profile and personalized stats. This profiling
              is used solely to enhance your experience within the app. It runs in your browser and is
              never shared with third parties.
            </p>
            <p className="mt-2">
              When game deals are displayed, they are based on games already in your library or wishlist.
              No third-party advertiser has access to your profile, library, or behavioral data.
              We do not build advertising segments, sell user profiles, or allow external parties
              to target you based on your data. We are not an advertising platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">We do not sell your data</h2>
            <p>
              We do not sell, rent, lease, or trade your personal information to any third party for
              any reason. Not for advertising. Not for marketing. Not for analytics. This applies to
              all data we collect: your email, your game library, your play history, your behavioral
              profile, and any other information associated with your account. Full stop.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Children&apos;s privacy</h2>
            <p>
              This app is not directed at children under 13. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Changes to this policy</h2>
            <p>
              We&apos;ll update this page if anything changes. Material changes will be noted with
              an updated date at the top.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Contact</h2>
            <p>
              Questions about your data? Reach out at{' '}
              <a href="mailto:privacy@inventoryfull.gg" className="text-accent-purple hover:underline">
                privacy@inventoryfull.gg
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle">
          <Link
            href="/terms"
            className="text-sm text-text-dim hover:text-accent-purple transition-colors"
          >
            Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
