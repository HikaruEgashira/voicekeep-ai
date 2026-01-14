/**
 * Web Storage Implementation
 * localStorage をラップして統一インターフェースを提供
 */

import type { PlatformStorage } from './index';

export const Storage: PlatformStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      console.warn('[Storage.web] localStorage not available');
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('[Storage.web] Failed to save to localStorage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn('[Storage.web] Failed to remove from localStorage');
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch {
      console.warn('[Storage.web] Failed to clear localStorage');
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch {
      console.warn('[Storage.web] Failed to get localStorage keys');
      return [];
    }
  },
};
