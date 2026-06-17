import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

// Steam offers ONLY OpenID 2.0 for third-party sign-in — no OAuth2, no scopes,
// no access token. This route does two jobs on one URL:
//   1. No openid.* params  -> build the checkid_setup redirect to Steam.
//   2. openid.mode=id_res  -> verify the assertion via check_authentication,
//      extract the SteamID64, then hand it back to the opener window
//      (postMessage) or fall back to a full-page redirect.
// The Steam Web API key is NOT needed here — OpenID is keyless. The key stays
// server-side in /api/steam for the owned-games fetch that happens afterward.

const OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login';
const OPENID_NS = 'http://specs.openid.net/auth/2.0';
const IDENTIFIER_SELECT = 'http://specs.openid.net/auth/2.0/identifier_select';

// Realm/return_to must be the public origin the user actually browses. Prefer
// the configured app URL; fall back to the request origin (dev = localhost).
function getOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

// Mirrors the iOS parse (SteamOpenID.swift): claimed_id is
// https://steamcommunity.com/openid/id/<steamid64>; take the trailing path
// segment and require exactly 17 digits.
function steamId64FromClaimedId(claimedId: string | null): string | null {
  if (!claimedId) return null;
  const trimmed = claimedId.endsWith('/') ? claimedId.slice(0, -1) : claimedId;
  const last = trimmed.split('/').pop() || '';
  return /^\d{17}$/.test(last) ? last : null;
}

// HTML returned after verification. Tries to message the opener (popup case);
// if there's no opener (popup was blocked → same-tab/new-tab redirect), it
// navigates the app with a query flag the landing page picks up.
function callbackHtml(origin: string, payload: { steamId: string | null; error: string | null }): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Steam sign-in</title></head>
<body style="background:#0a0a0f;color:#e5e5e5;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<p style="opacity:.7">Signing you in…</p>
<script>
(function(){
  var payload = ${JSON.stringify(payload)};
  var origin = ${JSON.stringify(origin)};
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'steam-openid', steamId: payload.steamId, error: payload.error }, origin);
      window.close();
      return;
    }
  } catch (e) {}
  var dest = payload.steamId
    ? ('/?steam_openid=' + encodeURIComponent(payload.steamId))
    : ('/?steam_openid_error=' + encodeURIComponent(payload.error || 'failed'));
  window.location.replace(dest);
})();
</script>
</body></html>`;
}

function htmlResponse(body: string) {
  return new NextResponse(body, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('openid.mode');

  // ── Step 1: no assertion yet → kick off the Steam sign-in redirect ──
  if (!mode) {
    const params = new URLSearchParams({
      'openid.ns': OPENID_NS,
      'openid.mode': 'checkid_setup',
      'openid.return_to': `${origin}/api/steam/openid`,
      'openid.realm': origin,
      'openid.identity': IDENTIFIER_SELECT,
      'openid.claimed_id': IDENTIFIER_SELECT,
    });
    return NextResponse.redirect(`${OPENID_ENDPOINT}?${params.toString()}`);
  }

  // ── User cancelled on Steam's page ──
  if (mode === 'cancel') {
    return htmlResponse(callbackHtml(origin, { steamId: null, error: 'cancelled' }));
  }

  // ── Step 2: assertion returned → verify it before trusting anything ──
  if (mode === 'id_res') {
    try {
      // Re-send every openid.* param back to Steam with mode=check_authentication.
      // Only an is_valid:true response means the assertion is genuine.
      const verifyBody = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key.startsWith('openid.')) verifyBody.set(key, value);
      });
      verifyBody.set('openid.mode', 'check_authentication');

      const verifyRes = await fetchWithTimeout(OPENID_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: verifyBody.toString(),
      });
      const verifyText = await verifyRes.text();
      const isValid = /is_valid\s*:\s*true/i.test(verifyText);

      if (!isValid) {
        return htmlResponse(callbackHtml(origin, { steamId: null, error: 'verification_failed' }));
      }

      const steamId = steamId64FromClaimedId(searchParams.get('openid.claimed_id'));
      if (!steamId) {
        return htmlResponse(callbackHtml(origin, { steamId: null, error: 'no_steamid' }));
      }

      return htmlResponse(callbackHtml(origin, { steamId, error: null }));
    } catch (err) {
      console.error('Steam OpenID error:', err);
      Sentry.captureException(err, { tags: { route: 'steam-openid' } });
      return htmlResponse(callbackHtml(origin, { steamId: null, error: 'failed' }));
    }
  }

  // Unknown mode — bounce home rather than hang.
  return htmlResponse(callbackHtml(origin, { steamId: null, error: 'failed' }));
}
