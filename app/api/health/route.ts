import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Health endpoint actually probes downstream dependencies.
// Returns 200 only if Supabase is reachable. UptimeRobot uses this.
// Keep the probe cheap (single SELECT count head) to stay under any timeout.

export async function GET() {
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // Supabase probe
  if (supabaseServer) {
    const t0 = Date.now();
    try {
      const { error } = await supabaseServer
        .from('app_meta')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      checks.supabase = error
        ? { ok: false, latencyMs: Date.now() - t0, error: error.message }
        : { ok: true, latencyMs: Date.now() - t0 };
    } catch (err) {
      checks.supabase = {
        ok: false,
        latencyMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    checks.supabase = { ok: false, error: 'not_configured' };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: Date.now(),
      uptime: process.uptime(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
