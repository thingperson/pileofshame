// Steam OpenID return target for the iOS app. Steam requires an http(s) return_to/realm; this
// 302-redirects the browser into the iOS app's custom scheme so ASWebAuthenticationSession captures
// it. Using inventoryfull.gg as the realm makes Steam's consent screen show our domain instead of a
// supabase.co function URL (which looked untrustworthy). This is a pure, secret-less redirect — the
// Steam Web API key stays server-side in /api/steam for the owned-games fetch.
//
// NOTE: hand-built Response, not NextResponse.redirect() — the latter rejects non-http(s) URLs
// (custom schemes). The Supabase Edge Function stays in place as a fallback.
export function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.search; // includes leading "?", with the openid.* params
  const target = `inventoryfull://steam-callback${qs}`;
  return new Response(null, { status: 302, headers: { Location: target, 'Cache-Control': 'no-store' } });
}
