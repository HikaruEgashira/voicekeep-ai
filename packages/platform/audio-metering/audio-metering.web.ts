/**
 * Web Audio Metering Implementation
 * Web Audio API (AnalyserNode) を使用して音声レベルを取得
 */

import type { AudioMeteringConfig, AudioMeteringController } from './index';

export function createAudioMetering(_config?: AudioMeteringConfig): AudioMeteringController {
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let animationFrameId: number | null = null;
  let isActive = false;
  let callbacks: Set<(db: number) => void> = new Set();

  const updateMetering = () => {
    if (!analyser || !isActive) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // RMS計算
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // 0-255 を -60dB〜0dB に変換
    const db = rms > 0 ? 20 * Math.log10(rms / 255) : -60;
    const clampedDb = Math.max(-60, Math.min(0, db));

    callbacks.forEach((cb) => cb(clampedDb));

    animationFrameId = requestAnimationFrame(updateMetering);
  };

  return {
    async start(): Promise<void> {
      if (isActive) return;

      try {
        console.log('[AudioMetering.web] Starting audio metering...');

        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();

        const source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;

        source.connect(analyser);
        isActive = true;

        updateMetering();

        console.log('[AudioMetering.web] Audio metering started');
      } catch (error) {
        console.error('[AudioMetering.web] Failed to start:', error);
        throw error;
      }
    },

    async stop(): Promise<void> {
      if (!isActive) return;

      console.log('[AudioMetering.web] Stopping audio metering...');

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }

      if (audioContext) {
        await audioContext.close();
        audioContext = null;
      }

      analyser = null;
      isActive = false;

      console.log('[AudioMetering.web] Audio metering stopped');
    },

    onMeteringUpdate(callback: (db: number) => void): () => void {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },

    isActive(): boolean {
      return isActive;
    },
  };
}
