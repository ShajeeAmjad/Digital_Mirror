import { Session } from '@supabase/supabase-js';
import { useState } from 'react';

import { api } from '@/api/client';
import { supabase } from '@/lib/supabase';

interface UseAuthReturn {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUp(email: string, password: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase.auth.signUp({ email, password });
      if (sbError) {
        setError(sbError.message);
        return;
      }
      if (data.session) {
        setSession(data.session);
        // Create the profile row on the backend
        await api.post('/api/v1/auth/profile', {});
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (sbError) {
        setError(sbError.message);
        return;
      }
      if (data.session) {
        setSession(data.session);
      }
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

  return { signUp, signIn, signOut, session, isLoading, error };
}
