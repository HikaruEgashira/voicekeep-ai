/**
 * Web Permissions Implementation
 * Web ではブラウザが録音開始時に自動的に許可を求める
 */

import type { PlatformPermissions, PermissionStatus } from './index';

export const Permissions: PlatformPermissions = {
  async getMicrophonePermission(): Promise<PermissionStatus> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (result.state === 'granted') return 'granted';
      if (result.state === 'denied') return 'denied';
      return 'undetermined';
    } catch {
      // permissions API が使えない場合は undetermined として扱う
      return 'undetermined';
    }
  },

  async requestMicrophonePermission(): Promise<PermissionStatus> {
    // Web では実際の許可ダイアログは getUserMedia 呼び出し時に表示される
    // ここでは granted を返して、実際の許可は録音開始時に行う
    try {
      // 一時的にマイクにアクセスして許可を求める
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // すぐにストリームを停止
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch {
      return 'denied';
    }
  },
};
