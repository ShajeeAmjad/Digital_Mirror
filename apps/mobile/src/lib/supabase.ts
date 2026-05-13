import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1900;

const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const numChunksStr = await SecureStore.getItemAsync(`${key}_numChunks`);
    if (!numChunksStr) return SecureStore.getItemAsync(key);
    const chunks: string[] = [];
    for (let i = 0; i < parseInt(numChunksStr, 10); i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
      if (chunk === null) return null;
      chunks.push(chunk);
    }
    return chunks.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const numChunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}_numChunks`, String(numChunks));
    for (let i = 0; i < numChunks; i++) {
      await SecureStore.setItemAsync(`${key}_chunk_${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
  },

  async removeItem(key: string): Promise<void> {
    const numChunksStr = await SecureStore.getItemAsync(`${key}_numChunks`);
    if (numChunksStr) {
      for (let i = 0; i < parseInt(numChunksStr, 10); i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_numChunks`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
