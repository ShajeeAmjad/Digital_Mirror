import * as SecureStore from 'expo-secure-store';

import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync('sb-access-token');
}

async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync('sb-access-token', accessToken);
  await SecureStore.setItemAsync('sb-refresh-token', refreshToken);
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<ApiResponse<T>> {
  const token = await getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      await saveTokens(data.session.access_token, data.session.refresh_token);
      return apiRequest<T>(path, options, false);
    }
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
