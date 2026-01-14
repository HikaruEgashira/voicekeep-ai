/**
 * Background Task Abstraction
 *
 * バックグラウンド録音タスクの管理
 * expo-task-manager (Native) / no-op (Web)
 */

export interface PlatformBackgroundTask {
  isSupported(): boolean;
  start(): Promise<void>;
  stop(): Promise<void>;
  isRegistered(): Promise<boolean>;
}

// Metro/Webpack resolves platform-specific files (.native.ts, .web.ts)
export { BackgroundTask } from './background-task';
