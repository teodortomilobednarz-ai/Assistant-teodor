import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, NutritionGoals, calculateNutritionGoals } from '../services/bmr';

const STORAGE_KEY = '@nutrascan_user_profile';
const ONBOARDING_KEY = '@nutrascan_onboarding_done';

interface UserContextValue {
  profile: UserProfile | null;
  goals: NutritionGoals | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  goals: null,
  hasCompletedOnboarding: false,
  isLoading: true,
  saveProfile: async () => {},
  clearProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedProfile, onboardingDone] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);
        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (onboardingDone === 'true') setHasCompletedOnboarding(true);
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
  }, []);

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
      value={{ profile, goals, hasCompletedOnboarding, isLoading, saveProfile, clearProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
