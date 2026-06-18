import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertFoodLog } from '../services/database';

export interface FoodEntry {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  icon: string;
  loggedAt: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyLogContextValue {
  entries: FoodEntry[];
  totals: DailyTotals;
  isLoading: boolean;
  addEntry: (entry: Omit<FoodEntry, 'id' | 'loggedAt'>, deviceId?: string | null) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

const ZERO_TOTALS: DailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

const DailyLogContext = createContext<DailyLogContextValue>({
  entries: [],
  totals: ZERO_TOTALS,
  isLoading: true,
  addEntry: async () => {},
  removeEntry: async () => {},
});

const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `@nutrascan_log_${yyyy}-${mm}-${dd}`;
};

const todayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function DailyLogProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(todayKey());
        if (stored) setEntries(JSON.parse(stored));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (next: FoodEntry[]) => {
    await AsyncStorage.setItem(todayKey(), JSON.stringify(next));
    setEntries(next);
  };

  const addEntry = useCallback(async (
    entry: Omit<FoodEntry, 'id' | 'loggedAt'>,
    deviceId?: string | null
  ) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 10),
      loggedAt: new Date().toISOString(),
    };
    await persist([...entries, newEntry]);

    // Supabase sync — fire and forget
    if (deviceId) {
      insertFoodLog(deviceId, {
        log_date: todayDate(),
        food_name: entry.foodName,
        calories: entry.calories,
        protein_g: entry.protein,
        carbs_g: entry.carbs,
        fat_g: entry.fat,
        meal_time: entry.mealTime,
        icon: entry.icon,
      }).catch(() => {});
    }
  }, [entries]);

  const removeEntry = useCallback(async (id: string) => {
    await persist(entries.filter((e) => e.id !== id));
  }, [entries]);

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    ZERO_TOTALS
  );

  return (
    <DailyLogContext.Provider value={{ entries, totals, isLoading, addEntry, removeEntry }}>
      {children}
    </DailyLogContext.Provider>
  );
}

export function useDailyLog() {
  return useContext(DailyLogContext);
}
