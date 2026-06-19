import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Dynamically imported to avoid crash on Android/simulator
let AppleHealthKit: any = null;
if (Platform.OS === 'ios') {
  try {
    AppleHealthKit = require('react-native-health').default;
  } catch {
    // HealthKit not available (simulator without HealthKit)
  }
}

const PERMISSIONS = AppleHealthKit
  ? {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        ],
        write: [],
      },
    }
  : null;

export function useHealthKit() {
  const [steps, setSteps] = useState(0);
  const [bonusKcal, setBonusKcal] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const refresh = useCallback(() => {
    if (!AppleHealthKit || !PERMISSIONS) return;

    AppleHealthKit.isAvailable((_err: any, available: boolean) => {
      if (!available) return;
      setIsAvailable(true);

      AppleHealthKit.initHealthKit(PERMISSIONS, (initErr: any) => {
        if (initErr) return;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        AppleHealthKit.getStepCount(
          { date: todayStart.toISOString() },
          (_e: any, result: { value: number }) => {
            if (result?.value) {
              const s = Math.round(result.value);
              setSteps(s);
              setBonusKcal(Math.round(s * 0.04));
            }
          }
        );
      });
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') refresh();
  }, [refresh]);

  return { steps, bonusKcal, isAvailable, refresh };
}
