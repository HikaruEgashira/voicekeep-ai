/**
 * Native (iOS/Android) Background Task Implementation
 * expo-task-manager を使用してバックグラウンド録音を管理
 */

import * as TaskManager from 'expo-task-manager';
import { setAudioModeAsync } from 'expo-audio';
import type { PlatformBackgroundTask } from './index';

const BACKGROUND_RECORDING_TASK = 'BACKGROUND_RECORDING_TASK';

// タスクを定義（モジュール読み込み時に実行される）
TaskManager.defineTask(BACKGROUND_RECORDING_TASK, async () => {
  // バックグラウンドで録音を継続するためのダミータスク
  // 実際の録音は expo-audio が処理
  return {};
});

export const BackgroundTask: PlatformBackgroundTask = {
  isSupported(): boolean {
    return true;
  },

  async start(): Promise<void> {
    try {
      // バックグラウンド録音を有効化
      await setAudioModeAsync({
        allowsBackgroundRecording: true,
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        allowsRecording: true,
      });

      console.log('[BackgroundTask.native] Background recording enabled');
    } catch (error) {
      console.error('[BackgroundTask.native] Failed to enable background recording:', error);
    }
  },

  async stop(): Promise<void> {
    try {
      // バックグラウンド録音を無効化
      await setAudioModeAsync({
        allowsBackgroundRecording: false,
      });

      console.log('[BackgroundTask.native] Background recording disabled');
    } catch (error) {
      console.error('[BackgroundTask.native] Failed to disable background recording:', error);
    }
  },

  async isRegistered(): Promise<boolean> {
    try {
      return await TaskManager.isTaskRegisteredAsync(BACKGROUND_RECORDING_TASK);
    } catch {
      return false;
    }
  },
};
