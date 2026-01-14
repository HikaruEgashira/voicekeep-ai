/**
 * FileSystem Abstraction
 *
 * expo-file-system (Native) / Blob API (Web) を統一インターフェースで提供
 */

export interface PlatformFileSystem {
  readonly documentDirectory: string | null;

  readAsBase64(uri: string): Promise<string>;
  writeAsBase64(uri: string, base64: string): Promise<void>;
  moveAsync(from: string, to: string): Promise<void>;
  makeDirectoryAsync(path: string, options?: { intermediates?: boolean }): Promise<void>;
  getInfoAsync(uri: string): Promise<{ exists: boolean; size?: number }>;
  deleteAsync(uri: string): Promise<void>;

  /**
   * Blob を Base64 文字列に変換
   * Web版では録音データの保存に使用
   */
  blobToBase64(blob: Blob): Promise<string>;
}

// Metro/Webpack resolves platform-specific files (.native.ts, .web.ts)
export { FileSystem } from './filesystem';
