/**
 * Haptics Abstraction
 *
 * expo-haptics (Native) / no-op (Web) を統一インターフェースで提供
 */

export type HapticFeedbackStyle = 'light' | 'medium' | 'heavy';
export type HapticNotificationType = 'success' | 'warning' | 'error';

export interface PlatformHaptics {
  impact(style: HapticFeedbackStyle): Promise<void>;
  notification(type: HapticNotificationType): Promise<void>;
  selection(): Promise<void>;
}

// Metro/Webpack resolves platform-specific files (.native.ts, .web.ts)
export { Haptics } from './haptics';
