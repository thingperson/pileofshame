import * as Sentry from "@sentry/nextjs";

// Sentry server-side init. Includes a beforeSend scrubber to strip credentials
// from request payloads before they leave our infra. PSN auth uses NPSSO
// tokens that flow through POST bodies — these MUST never reach Sentry.

const CREDENTIAL_KEYS = ['npsso', 'token', 'access_token', 'refresh_token', 'authorization', 'api_key', 'apiKey', 'password'];

function scrubObject(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => scrubObject(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (CREDENTIAL_KEYS.some((c) => k.toLowerCase().includes(c.toLowerCase()))) {
      out[k] = '[scrubbed]';
    } else {
      out[k] = scrubObject(v, depth + 1);
    }
  }
  return out;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Sample rate for error events (1.0 = 100%)
  sampleRate: 1.0,

  // Performance monitoring sample rate (keep low for free tier)
  tracesSampleRate: 0.1,

  // Don't send PII
  sendDefaultPii: false,

  beforeSend(event) {
    // Scrub credentials from request data
    if (event.request) {
      if (event.request.data) {
        event.request.data = scrubObject(event.request.data) as typeof event.request.data;
      }
      // Strip Authorization headers entirely
      if (event.request.headers) {
        const headers = { ...event.request.headers };
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'cookie') {
            headers[key] = '[scrubbed]';
          }
        }
        event.request.headers = headers;
      }
    }
    // Scrub breadcrumbs that may contain creds
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b) => {
        if (b.data) return { ...b, data: scrubObject(b.data) as typeof b.data };
        return b;
      });
    }
    return event;
  },
});
