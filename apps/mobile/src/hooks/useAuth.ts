import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { createSessionFromUrl } from '@/lib/oauth';
import { supabase } from '@/lib/supabase';

interface UseAuthReturn {
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signOut: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUp(email: string, password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase.auth.signUp({ email, password });
      if (sbError) { setError(sbError.message); return false; }
      if (data.session) {
        setSession(data.session);
        // Create the profile row on the backend (fire and forget — non-blocking)
        supabase.auth.getSession().then(({ data: s }) => {
          if (s.session) {
            fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'}/api/v1/auth/profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${s.session.access_token}`,
              },
              body: JSON.stringify({}),
            }).catch(() => {/* non-fatal */});
          }
        });
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({ email, password });
      if (sbError) { setError(sbError.message); return false; }
      if (data.session) setSession(data.session);
      return true;
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithProvider(provider: 'google' | 'facebook'): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const redirectTo = Linking.createURL('auth/callback', { scheme: 'com.digitalmirror' });
      const { data, error: sbError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (sbError || !data.url) {
        setError(sbError?.message ?? 'OAuth failed');
        return false;
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return false;
      await createSessionFromUrl(result.url);
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) setSession(sessionData.session);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OAuth failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signUp,
    signIn,
    signInWithGoogle: () => signInWithProvider('google'),
    signInWithFacebook: () => signInWithProvider('facebook'),
    signOut,
    session,
    isLoading,
    error,
  };
}
