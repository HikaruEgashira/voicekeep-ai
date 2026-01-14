/**
 * Native (iOS/Android) Storage Implementation
 * AsyncStorage をラップして統一インターフェースを提供
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlatformStorage } from './index';

export const Storage: PlatformStorage = {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },

  async getAllKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  },
};
