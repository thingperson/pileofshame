# Supabase migrations — conventions

Numbered sequentially (`001_*.sql`, `002_*.sql`, etc.). Apply via the Supabase dashboard SQL editor or `supabase db push` if the CLI is wired locally.

## After Oct 30, 2026 — explicit grants required

Supabase is changing the default: new tables in the `public` schema will not be auto-exposed to the Data API (`supabase-js`, PostgREST, GraphQL) unless explicitly granted. This applies to **all existing projects from Oct 30, 2026** for any *new* tables created after that date. Existing tables keep their current grants.

Any new migration that creates a public table must include the grant + RLS + policy block:

```sql
CREATE TABLE IF NOT EXISTS public.your_table (
  ...
);

-- Required after Oct 30, 2026 — without these, supabase-js cannot reach the table.
GRANT SELECT ON public.your_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO service_role;

ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read their own rows"
  ON public.your_table
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

If you forget, PostgREST returns a `42501` error containing the exact GRANT statement to fix it. Not catastrophic, just annoying — better to bake it in.

## Other conventions

- Use `IF NOT EXISTS` on tables and indexes so re-runs are safe.
- Top-of-file comment explaining *why* the table exists (see `008_email_subscribers.sql` for the pattern).
- RLS on every public table. Always.
