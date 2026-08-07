# Prod health loop (B1) — spec

*Written 2026-08-06. Status: SPECCED, being registered as a scheduled task same day.*

## What this is

A daily automated check that reads Sentry and tells Brady what's actually breaking in production, in plain terms, without him having to open the Sentry dashboard. Direct response to: "we have sentry throwing errors sometime, good to know what those are about."

## What this is NOT

- Not an uptime monitor. UptimeRobot already pings `/api/health` (which itself probes Supabase reachability) — this loop doesn't duplicate that.
- Not an auto-fix agent. Surface only, same boundary as `regress-watch` and the decisions-audit tasks — never patches code, never pushes.
- Not a third weekly audit. Runs daily, but the job is small (query Sentry, summarize, done) — not a full sweep like the Monday/Sunday tasks.

## What it checks

1. **Sentry, both projects** (org `inventory-full`, projects `javascript-nextjs` web + `inventory-full-bot`): new/unresolved issues from roughly the last 24-48h. For each: what it is, how many times it fired, first/last seen, and — if the Seer analysis tool is available — its take on likely cause. No fix attempted.
2. If the Sentry MCP connector isn't available in a given run (it disconnects/reconnects across sessions), say so plainly rather than reporting "no errors" — a missing signal is not a clean signal.

## Output

- If there's nothing new: one line, no file written. Don't accumulate a "nothing happened" file every day.
- If there's something real: a short digest as the task's own output (surfaces via the scheduled-task completion notification). Only write to `docs/audits/prod-health-log.md` (append, create if missing) when there's something worth a permanent record — a new error class, not a single stray occurrence of something already known.

## Schedule

Daily, 8:00 AM local. Chosen to land before Brady's typical session start; adjustable — this is a default, not a negotiated time.

## Open item

Sentry MCP tools were disconnected mid-session on 2026-08-06 (server reconnect cycling — seen with other MCP servers too, not unique to Sentry). The scheduled task's prompt handles this by searching for Sentry tools fresh each run and reporting plainly if unavailable, rather than assuming a fixed tool name will always resolve.
