/**
 * Native (iOS/Android) Haptics Implementation
 * expo-haptics をラップして統一インターフェースを提供
 */

import * as ExpoHaptics from 'expo-haptics';
import type { PlatformHaptics, HapticFeedbackStyle, HapticNotificationType } from './index';

const impactStyleMap: Record<HapticFeedbackStyle, ExpoHaptics.ImpactFeedbackStyle> = {
  light: ExpoHaptics.ImpactFeedbackStyle.Light,
  medium: ExpoHaptics.ImpactFeedbackStyle.Medium,
  heavy: ExpoHaptics.ImpactFeedbackStyle.Heavy,
};

const notificationTypeMap: Record<HapticNotificationType, ExpoHaptics.NotificationFeedbackType> = {
  success: ExpoHaptics.NotificationFeedbackType.Success,
  warning: ExpoHaptics.NotificationFeedbackType.Warning,
  error: ExpoHaptics.NotificationFeedbackType.Error,
};

export const Haptics: PlatformHaptics = {
  async impact(style: HapticFeedbackStyle): Promise<void> {
    await ExpoHaptics.impactAsync(impactStyleMap[style]);
  },

  async notification(type: HapticNotificationType): Promise<void> {
    await ExpoHaptics.notificationAsync(notificationTypeMap[type]);
  },

  async selection(): Promise<void> {
    await ExpoHaptics.selectionAsync();
  },
};
