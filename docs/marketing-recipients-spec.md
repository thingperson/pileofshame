# `marketing_recipients` view — spec

**Status:** Locked spec, not yet built. Build only when send infrastructure (Resend / equivalent) is on the near roadmap.

## Why this exists

We collect opted-in emails from two distinct sources:

1. **`auth.users.email`** for signed-in users where `profiles.wants_updates = true` (the in-app "email me about updates" toggle).
2. **`email_subscribers.email`** for unauthenticated visitors who used the landing/about email capture form.

The same person can land in both — they subscribe unauth, then later create an account. Sending to both = duplicate emails = instant unsubscribe. The view is the single read surface every send job uses, so dedupe is enforced at the data layer instead of every job.

## SQL

```sql
CREATE OR REPLACE VIEW marketing_recipients AS
  SELECT DISTINCT ON (lower(email))
    lower(email) AS email,
    source,
    consented_at
  FROM (
    SELECT email, 'subscriber' AS source, consented_at
    FROM email_subscribers
    WHERE unsubscribed_at IS NULL

    UNION ALL

    SELECT u.email, 'auth_user' AS source, u.created_at AS consented_at
    FROM auth.users u
    JOIN profiles p ON p.user_id = u.id
    WHERE p.wants_updates = true
  ) all_consented
  WHERE email IS NOT NULL
  ORDER BY lower(email), consented_at ASC;
```

`DISTINCT ON (lower(email))` + `ORDER BY consented_at ASC` keeps the **earliest** consent record per email, so the source attribution reflects when the user actually first opted in.

## Rules

- Every send job MUST query `marketing_recipients`. No raw reads of `email_subscribers` or `auth.users` for email purposes.
- The view is read-only. Unsubscribes happen on the underlying tables (`email_subscribers.unsubscribed_at` for unauth, `profiles.wants_updates = false` for auth users) and the view re-reflects automatically.
- The unsubscribe flow already covers the unauth path (`/api/unsubscribe` sets `unsubscribed_at`). When Resend lands, the auth-user path needs to be added — either via in-app settings toggle (current state) OR by extending `/api/unsubscribe` to look up `auth.users` by email server-side and flip `wants_updates`.

## Migration plan when ready

1. Add as `supabase/migrations/00X_marketing_recipients.sql`.
2. Grant `service_role` SELECT on the view (no RLS needed since it's a view; underlying RLS still applies).
3. Update `app/api/unsubscribe/route.ts` to ALSO flip `wants_updates` for matching auth user (lookup via `supabaseServer.auth.admin.listUsers({ email })` or a privileged RPC).
4. Add Resend integration that reads exclusively from this view.

## What we're NOT doing here

- No engagement scoring (last opened, click rate). Premature.
- No segmentation columns (signup source, archetype, country). Premature.
- No `tags` column. Premature.

Keep this view dumb and dedupe-only. Layer segmentation on top later if needed.
