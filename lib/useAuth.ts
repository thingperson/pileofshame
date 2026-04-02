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
          if (isNew) trackSignUp(provider); else trackLogin(provider);
        }
        if (event === 'SIGNED_OUT') {
          trackLogout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
    if (error) console.error('Discord sign-in error:', error);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
    if (error) console.error('Google sign-in error:', error);
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
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
