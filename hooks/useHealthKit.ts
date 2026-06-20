// react-native-health@1.19.0 is incompatible with React Native 0.73+ new architecture
// (uses old RCTBridgeModule setBridge: API that was removed). Stubbed for now.
export function useHealthKit() {
  return { steps: 0, bonusKcal: 0, isAvailable: false, refresh: () => {} };
}
