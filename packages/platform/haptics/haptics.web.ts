/**
 * Web Haptics Implementation
 * Web では Haptics API は未サポートのため no-op 実装
 */

import type { PlatformHaptics, HapticFeedbackStyle, HapticNotificationType } from './index';

export const Haptics: PlatformHaptics = {
  async impact(_style: HapticFeedbackStyle): Promise<void> {
    // Web does not support haptics
  },

  async notification(_type: HapticNotificationType): Promise<void> {
    // Web does not support haptics
  },

  async selection(): Promise<void> {
    // Web does not support haptics
  },
};
