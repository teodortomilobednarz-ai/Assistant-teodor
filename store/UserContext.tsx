import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, NutritionGoals, calculateNutritionGoals } from '../services/bmr';
import { upsertProfile } from '../services/database';

const STORAGE_KEY = '@nutrascan_user_profile';
const ONBOARDING_KEY = '@nutrascan_onboarding_done';
const DEVICE_ID_KEY = '@nutrascan_device_id';

function generateDeviceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface UserContextValue {
  profile: UserProfile | null;
  goals: NutritionGoals | null;
  deviceId: string | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  goals: null,
  deviceId: null,
  hasCompletedOnboarding: false,
  isLoading: true,
  saveProfile: async () => {},
  clearProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedProfile, onboardingDone, storedDeviceId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(DEVICE_ID_KEY),
        ]);

        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (onboardingDone === 'true') setHasCompletedOnboarding(true);

        let id = storedDeviceId;
        if (!id) {
          id = generateDeviceId();
          await AsyncStorage.setItem(DEVICE_ID_KEY, id);
        }
        setDeviceId(id);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile)),
      AsyncStorage.setItem(ONBOARDING_KEY, 'true'),
    ]);
    setProfile(newProfile);
    setHasCompletedOnboarding(true);

    // Sync to Supabase (non-blocking)
    if (deviceId) {
      upsertProfile(deviceId, newProfile).catch(() => {});
    }
  }, [deviceId]);

  const clearProfile = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(ONBOARDING_KEY),
    ]);
    setProfile(null);
    setHasCompletedOnboarding(false);
  }, []);

  const goals = profile ? calculateNutritionGoals(profile) : null;

  return (
    <UserContext.Provider
      value={{ profile, goals, deviceId, hasCompletedOnboarding, isLoading, saveProfile, clearProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
