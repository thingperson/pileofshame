-- wants_updates: explicit, unchecked-by-default opt-in for product update emails.
-- Separate from auth consent. Stored on the profile row so it's easy to read/write
-- from the client under RLS. consented_at records the exact moment the user ticked
-- the box (null = never opted in). A user can toggle this off later via settings;
-- when they do, consented_at is preserved for audit (so we can prove when consent
-- was given + honored revocation).
--
-- handle_new_user() is extended to read wants_updates from raw_user_meta_data
-- (populated by signInWithOtp options.data for email flows). For OAuth flows the
-- client writes directly to the profile after SIGNED_IN because the OAuth redirect
-- doesn't carry arbitrary metadata.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS wants_updates BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS wants_updates_consented_at TIMESTAMPTZ;

-- Partial index to make it cheap to select the marketing-eligible audience.
CREATE INDEX IF NOT EXISTS idx_profiles_wants_updates
  ON profiles(wants_updates)
  WHERE wants_updates = TRUE;

-- Rewrite handle_new_user to carry wants_updates through if present in metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  wants BOOLEAN := COALESCE((NEW.raw_user_meta_data->>'wants_updates')::BOOLEAN, FALSE);
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    avatar_url,
    wants_updates,
    wants_updates_consented_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    wants,
    CASE WHEN wants THEN NOW() ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
