// Sentry client-side error monitoring (free tier)
// DSN configured via NEXT_PUBLIC_SENTRY_DSN in Vercel env vars
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Log DSN availability in dev for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Sentry] DSN configured:', !!dsn);
}

Sentry.init({
  dsn,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Sample rate for error events (1.0 = 100%)
  sampleRate: 1.0,

  // Performance monitoring sample rate (keep low for free tier)
  tracesSampleRate: 0.1,

  // Don't send PII
  sendDefaultPii: false,

  // Capture unhandled promise rejections
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
});
