'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';
import { trackSignUp, trackLogin, trackLogout } from './analytics';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://inventoryfull.gg';

// Marketing opt-in stash for OAuth flows. The OAuth redirect can't carry arbitrary
// metadata, so we stash the checkbox value in localStorage before redirecting and
// apply it to the profile row on SIGNED_IN (new user only). Email OTP flow bypasses
// this entirely — it passes wants_updates through options.data.
const PENDING_WANTS_UPDATES_KEY = 'if_pendingWantsUpdates';

function stashPendingWantsUpdates(wants: boolean) {
  try {
    if (wants) localStorage.setItem(PENDING_WANTS_UPDATES_KEY, '1');
    else localStorage.removeItem(PENDING_WANTS_UPDATES_KEY);
  } catch {}
}

function readAndClearPendingWantsUpdates(): boolean {
  try {
    const v = localStorage.getItem(PENDING_WANTS_UPDATES_KEY);
    if (v) localStorage.removeItem(PENDING_WANTS_UPDATES_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: !supabase ? false : true, // If no supabase, skip loading state
  });

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });

        // Track auth events in GA
        if (event === 'SIGNED_IN' && session?.user) {
          const provider = session.user.app_metadata?.provider || 'unknown';
          const isNew = session.user.created_at === session.user.updated_at
            || (Date.now() - new Date(session.user.created_at).getTime()) < 60000;
          if (isNew) {
            trackSignUp(provider);
            // Apply stashed OAuth wants_updates opt-in to the profile row. The DB
            // trigger already seeded wants_updates=false; we only write if the
            // user actually ticked the box pre-redirect.
            const pendingWants = readAndClearPendingWantsUpdates();
            if (pendingWants && supabase) {
              supabase
                .from('profiles')
                .update({ wants_updates: true, wants_updates_consented_at: new Date().toISOString() })
                .eq('user_id', session.user.id)
                .then(({ error }) => {
                  if (error) console.error('wants_updates persist error:', error);
                });
            }
          } else {
            trackLogin(provider);
          }
        }
        if (event === 'SIGNED_OUT') {
          trackLogout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = useCallback(async (wantsUpdates = false) => {
    if (!supabase) return;
    stashPendingWantsUpdates(wantsUpdates);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
    if (error) console.error('Discord sign-in error:', error);
  }, []);

  const signInWithGoogle = useCallback(async (wantsUpdates = false) => {
    if (!supabase) return;
    stashPendingWantsUpdates(wantsUpdates);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
    if (error) console.error('Google sign-in error:', error);
  }, []);

  const signInWithEmail = useCallback(async (email: string, wantsUpdates = false) => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
        // Carried into auth.users.raw_user_meta_data; handle_new_user() reads it
        // and seeds profiles.wants_updates on insert.
        data: { wants_updates: wantsUpdates },
      },
    });
    if (error) console.error('Email sign-in error:', error);
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    ...authState,
    signInWithDiscord,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    isSignedIn: !!authState.user,
  };
}
