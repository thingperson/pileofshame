import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload warnings when DSN not configured
  silent: true,
  // Don't widen existing source maps (keeps build fast)
  widenClientFileUpload: false,
});
