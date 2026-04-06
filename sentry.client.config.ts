import * as Sentry from "@sentry/nextjs";

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
});
