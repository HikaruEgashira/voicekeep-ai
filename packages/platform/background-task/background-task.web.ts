/**
 * Web Background Task Implementation
 * Web ではバックグラウンド録音はサポートされないため no-op
 */

import type { PlatformBackgroundTask } from './index';

export const BackgroundTask: PlatformBackgroundTask = {
  isSupported(): boolean {
    return false;
  },

  async start(): Promise<void> {
    // Web does not support background recording
    console.log('[BackgroundTask.web] Background recording not supported on web');
  },

  async stop(): Promise<void> {
    // Web does not support background recording
  },

  async isRegistered(): Promise<boolean> {
    return false;
  },
};
