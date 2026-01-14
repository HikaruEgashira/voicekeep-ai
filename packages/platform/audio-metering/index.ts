/**
 * Audio Metering Abstraction
 *
 * Web Audio API (Web) / expo-audio-stream (Native) を統一インターフェースで提供
 */

export interface AudioMeteringConfig {
  sampleRate?: number;
  updateInterval?: number;
}

export interface AudioMeteringController {
  start(): Promise<void>;
  stop(): Promise<void>;
  onMeteringUpdate(callback: (db: number) => void): () => void;
  isActive(): boolean;
}

// Metro/Webpack resolves platform-specific files (.native.ts, .web.ts)
export { createAudioMetering } from './audio-metering';
