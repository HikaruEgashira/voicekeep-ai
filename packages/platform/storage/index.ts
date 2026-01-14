/**
 * Storage Abstraction
 *
 * AsyncStorage (Native) / localStorage (Web) を統一インターフェースで提供
 */

export interface PlatformStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Metro/Webpack resolves platform-specific files (.native.ts, .web.ts)
export { Storage } from './storage';
