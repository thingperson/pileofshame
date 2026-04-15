// Wraps fetch with an AbortController-based timeout. A slow upstream API
// (HLTB, PSN, RAWG, ITAD) without a timeout will peg a serverless function
// until Vercel's hard 10s limit, blocking the user and burning quota.
//
// Usage:
//   const res = await fetchWithTimeout(url, opts, 5000);

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// Wrap any awaitable in a timeout. Useful for SDK calls that don't accept
// AbortSignal (e.g. psn-api). Throws TimeoutError on timeout.
export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(`Timed out after ${timeoutMs}ms`)), timeoutMs);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}
