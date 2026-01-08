// Native implementation (iOS/Android)
// On native platforms, metering is obtained from expo-audio's useAudioRecorderState
// This hook is a no-op placeholder - actual metering values come from audioRecorder

export function useAudioMetering(_isRecording: boolean): number {
  // Return default value - actual metering is handled by useAudioRecorderState in recording-session-context
  return -160;
}
