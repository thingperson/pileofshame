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
          Last updated: July 15, 2026
        </p>

        <div className="space-y-8 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">The short version</h2>
            <p>
              We collect the minimum data needed to make the app work. We don&apos;t sell your data
              and we don&apos;t track you across the web. Our analytics are cookieless and anonymous:
              enough to see how many people visit and which pages get used, never enough to identify
              you or build ad profiles. That also means no cookie consent banner to click through.
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
                <h3 className="text-sm font-semibold text-text-primary mb-1">Behavioral and preference data</h3>
                <p>
                  To improve your recommendations over time, the app tracks how you interact with its
                  suggestion engine. This includes which games you skip when you use &ldquo;Pick My Game&rdquo;,
                  how you respond to nudges, and your dismissal preferences. This data is currently stored
                  in your browser&apos;s localStorage and never leaves your device.
                </p>
                <p className="mt-2">
                  If you create an account, this behavioral data may be synced to our servers via Supabase
                  to preserve your preferences across devices. This data is used solely to personalize your
                  experience within the app. It is never shared with third parties, used for advertising,
                  or made available to publishers, advertisers, or any external party.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you create an account (cloud sync)</h3>
                <p>
                  We store your email address, your synced game library data, and your recommendation
                  preferences via Supabase (our authentication and database provider). This enables
                  cloud sync across devices. Your behavioral data (skip history, nudge preferences,
                  player archetype) may also be synced to provide a consistent experience.
                  Supabase&apos;s privacy practices are governed by their own{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline">
                    privacy policy
                  </a>.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you import from Steam</h3>
                <p>
                  You can connect with &ldquo;Sign in through Steam,&rdquo; which uses Steam&apos;s own OpenID
                  sign-in. You authenticate on Steam&apos;s website, not ours &mdash; we never see your Steam
                  password, and Steam only sends us your public Steam ID. (You can also enter your Steam ID or
                  profile URL manually instead.) We then use the Steam Web API to fetch your public game list,
                  playtime, and achievement data. Your Steam ID is sent to our server to make the API call, but
                  we do not store your Steam credentials. The imported data is stored in your browser&apos;s
                  localStorage (or in your synced account if you&apos;re signed in).
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
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you opt into product update emails</h3>
                <p>
                  When you create an account, there&apos;s an unchecked checkbox labeled
                  &ldquo;Email me when we ship something worth knowing. No spam.&rdquo; If and only if
                  you tick it, we store that consent against your profile along with the timestamp
                  you gave it. We use it to send occasional product-update emails (new features, major
                  changes). We will not send marketing email on any other basis. Every such email
                  includes a one-click unsubscribe. Opting out revokes the consent immediately.
                  Auth emails (magic links, password reset, email change confirmation) are transactional
                  and are sent regardless of this setting because you asked for them.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you subscribe to product updates from the landing page</h3>
                <p>
                  If you submit your email through the &ldquo;Hear when we ship something good&rdquo;
                  form on the landing or about pages, we store your email address, the page you
                  submitted it from, your browser user-agent, and the timestamp of your consent.
                  We use this only to send occasional product-update emails (new features, major
                  changes). Every such email includes a one-click unsubscribe. We will not share,
                  sell, or rent this list to anyone, ever.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">If you send feedback</h3>
                <p>
                  When you submit through the Feedback widget, we store your message, the page URL
                  you sent it from, and your browser user-agent string. Email is optional. If you
                  provide an email, we use it only to reply to your specific feedback unless you
                  explicitly check the &ldquo;Hear from us about updates&rdquo; box at the time of
                  submission. That checkbox is the only way you can be added to a future marketing list.
                  We currently send no marketing email at all.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">The iOS app</h2>
            <p>
              Inventory Full for iOS is a separate native app that talks to the same Supabase backend
              as this website. It collects less than the web app, not more:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted mt-2">
              <li><strong>Account:</strong> your email address, used to sign in via email/password,
                Google, or Discord (your choice). We never see your Google or Discord password.</li>
              <li><strong>Your game library:</strong> the games you import or add, their status,
                playtime, and any notes you attach. Synced via Supabase if you&apos;re signed in.</li>
              <li><strong>Session:</strong> your sign-in session is stored in iOS Keychain, the
                system&apos;s encrypted credential store. It is never written to iCloud backup in
                plain form.</li>
              <li><strong>On-device only, never synced:</strong> the picker&apos;s behavioral signals
                (which games you skip, why, and how that shapes future picks) live in the app&apos;s
                local storage on your device. They do not leave your phone.</li>
            </ul>
            <p className="mt-2">
              No ads, no third-party analytics or crash reporting SDKs, and no tracking of any kind
              ship in the iOS app. We do not use your data to build advertising profiles, and we do
              not share it with anyone outside the Supabase infrastructure that runs the sync you
              opted into. Everything under &ldquo;We do not sell your data&rdquo; and &ldquo;Your
              rights&rdquo; below applies equally to the iOS app.
            </p>
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
              <li><strong>OpenXBL API</strong>: Xbox game library and achievements (when importing)</li>
              <li><strong>PlayStation Store API</strong>: PS Plus catalog browsing (game names only, no user data sent)</li>
              <li><strong>Xbox Game Pass catalog</strong>: Game Pass catalog browsing (game names only, no user data sent)</li>
              <li><strong>Supabase</strong>: authentication and cloud sync (when signed in)</li>
              <li><strong>Sentry</strong>: error monitoring (anonymous error reports, no personal data sent)</li>
              <li><strong>Vercel Analytics</strong>: cookieless, anonymous analytics — page views plus a few product events (e.g. that an import finished or a game was picked). No cookies, no personal data, no game or account identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Our Discord bot (Pip)</h2>
            <p>
              We run an optional Discord bot called Pip (<a href="https://inventory-full-bot.fly.dev" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline">inventory-full-bot.fly.dev</a>).
              Server admins can add Pip to their own Discord server to use slash commands like
              <span className="font-[family-name:var(--font-mono)]"> /pick</span> and
              <span className="font-[family-name:var(--font-mono)]"> /archetype</span>.
            </p>
            <p className="mt-2">
              Pip is stateless. It does not store any user data, message history, server membership,
              or persistent identifiers. It does not request privileged intents. It cannot read your
              messages — it only sees the slash command payloads Discord sends it when someone
              explicitly invokes one. Each interaction is processed in memory and discarded when the
              response is returned.
            </p>
            <p className="mt-2">
              Pip does not have access to your Inventory Full account, library, Steam/PSN/Xbox tokens,
              or any other data you&apos;ve given the web app. The bot and the web app share branding
              only, not data.
            </p>
            <p className="mt-2">
              Operational errors from Pip may be sent to Sentry (anonymous error reports, no Discord
              user IDs or message content) on the same terms as the rest of our error monitoring.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Affiliate disclosure</h2>
            <p>
              When we show game deals via IsThereAnyDeal, some links include affiliate parameters.
              If you buy a game through one of those links, we may earn a small commission at no
              extra cost to you. We disclose this in line on every deal surface so the affiliation
              is visible at the point of click, per FTC endorsement guidelines.
            </p>
            <p className="mt-2">
              We never recommend games to buy. We only show deals on games you already own or have
              wishlisted yourself. Our goal is to help you play what you have, not sell you more.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Cookies and tracking</h2>
            <p>
              We don&apos;t use tracking or advertising cookies, so there&apos;s no cookie consent
              banner to click through. The only cookies we set are strictly necessary sign-in
              cookies, and only if you create an account. Our analytics are cookieless (details below).
            </p>
            <p className="mt-2">
              <strong>Strictly necessary cookies (no consent required):</strong> sign-in session
              cookies set by Supabase when you choose to create an account. These are required to
              keep you logged in and cannot be disabled while you remain signed in.
            </p>
            <p className="mt-2">
              <strong>Vercel Analytics (no cookies):</strong> our only analytics. It records
              aggregate page views plus a few anonymous product events (for example, that an import
              finished or a game was picked) so we can see whether the app is actually helping people
              play. It is cookieless by design, sends no personal data and no game or account
              identifiers, and does not track you across sites. No pixel trackers, no fingerprinting.
              Because it collects no personal data, it runs without requiring consent.
            </p>
            <p className="mt-2">
              <strong>Error monitoring (no cookies):</strong> Sentry receives anonymous error reports
              when the app crashes. Reports include the error message and browser type. No personally
              identifiable information is sent. Authentication tokens and other credentials are
              automatically scrubbed before any report leaves your browser or our servers.
            </p>
            <p className="mt-2">
              We use localStorage (a browser storage mechanism) to save your app state locally.
              This is not a cookie and cannot be used for cross-site tracking.
            </p>
            <p className="mt-2">
              When you click deal links to third-party stores, those sites may set their own cookies
              for affiliate tracking and purchase attribution. We have no control over those cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">Data storage and retention</h2>
            <p>
              Without an account: your data lives in your browser only. This includes your game
              library, settings, recommendation preferences, skip history, nudge dismissals, and
              player archetype. You control it entirely. Clear your browser data and it&apos;s gone.
            </p>
            <p className="mt-2">
              With an account: your synced library data and behavioral preferences are stored in
              Supabase&apos;s infrastructure. You can delete your account and all associated
              data at any time by contacting us. Deletion includes all behavioral data, not just
              your game library.
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
              Our &ldquo;Pick My Game&rdquo; feature uses algorithmic matching based on your
              selected mood, available time, game metadata, and your history of past recommendations
              to suggest games from your own library. The engine learns from your skips and choices
              to make better suggestions over time. No AI models are used. No personal data is sent
              to external AI services. The matching happens entirely in your browser.
            </p>
            <p className="mt-2">
              We also analyze your library data (games owned, completion status, play hours, genres,
              skip patterns, nudge responses) to generate a &ldquo;Player Archetype&rdquo; profile,
              personalized stats, and contextual nudges (such as &ldquo;Did you finish this?&rdquo;
              or &ldquo;Pick up where you left off&rdquo;). This profiling is used solely to enhance
              your experience within the app. It runs in your browser and is never shared with
              third parties.
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
