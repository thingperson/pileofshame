export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = (...args: unknown[]) => {
  // @ts-expect-error - Sentry types
  import('@sentry/nextjs').then(Sentry => Sentry.captureRequestError?.(...args));
};
