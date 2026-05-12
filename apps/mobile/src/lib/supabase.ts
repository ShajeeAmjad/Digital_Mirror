import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';

class LargeSecureStore {
  private async _getEncryptionKey(key: string): Promise<Uint8Array> {
    const storeKey = `enc_key_${key}`;
    let keyHex = await SecureStore.getItemAsync(storeKey);
    if (!keyHex) {
      const raw = new Uint8Array(32);
      crypto.getRandomValues(raw);
      keyHex = Array.from(raw)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      await SecureStore.setItemAsync(storeKey, keyHex);
    }
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(keyHex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  async getItem(key: string): Promise<string | null> {
    const encryptedHex = await AsyncStorage.getItem(key);
    if (!encryptedHex) return null;
    try {
      const encKey = await this._getEncryptionKey(key);
      const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
      const aesCtr = new aesjs.ModeOfOperation.ctr(encKey);
      const decryptedBytes = aesCtr.decrypt(encryptedBytes);
      return aesjs.utils.utf8.fromBytes(decryptedBytes);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encKey = await this._getEncryptionKey(key);
    const textBytes = aesjs.utils.utf8.toBytes(value);
    const aesCtr = new aesjs.ModeOfOperation.ctr(encKey);
    const encryptedBytes = aesCtr.encrypt(textBytes);
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encryptedBytes));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`enc_key_${key}`).catch(() => {/* already deleted */});
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
