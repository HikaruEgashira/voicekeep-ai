/**
 * Permissions Abstraction
 *
 * マイク許可などの権限管理を統一インターフェースで提供
 */

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PlatformPermissions {
  getMicrophonePermission(): Promise<PermissionStatus>;
  requestMicrophonePermission(): Promise<PermissionStatus>;
}

// Metro/Webpack resolves platform-specific files (.native.ts, .web.ts)
export { Permissions } from './permissions';
