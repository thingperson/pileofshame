import { createHmac, timingSafeEqual } from 'crypto';

// Generate / verify unsubscribe tokens for email recipients.
// Tokens are HMAC-SHA256(email) keyed with UNSUBSCRIBE_SECRET. Stable across
// time so a single link in a sent email keeps working forever.

function getSecret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET;
  if (!s || s.length < 16) {
    throw new Error('UNSUBSCRIBE_SECRET must be set (>=16 chars)');
  }
  return s;
}

export function makeUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHmac('sha256', getSecret()).update(normalized).digest('hex');
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  let expected: string;
  try { expected = makeUnsubscribeToken(email); } catch { return false; }
  if (expected.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(token, 'hex'));
  } catch {
    return false;
  }
}

export function makeUnsubscribeUrl(origin: string, email: string): string {
  const token = makeUnsubscribeToken(email);
  const params = new URLSearchParams({ email, token });
  return `${origin}/unsubscribe?${params.toString()}`;
}
