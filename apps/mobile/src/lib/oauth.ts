import { supabase } from './supabase';

export async function createSessionFromUrl(url: string): Promise<void> {
  // OAuth tokens are in the URL hash fragment: #access_token=...&refresh_token=...
  // Magic link tokens are in the query string. Check both.
  const hashStr = url.includes('#') ? url.split('#')[1] : '';
  const queryStr = url.includes('?') ? (url.split('?')[1] ?? '').split('#')[0] : '';
  const params = new URLSearchParams(hashStr || queryStr);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token') ?? '';
  if (!access_token) return;
  await supabase.auth.setSession({ access_token, refresh_token });
}
