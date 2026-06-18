import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeightEntry {
  date: string;   // YYYY-MM-DD
  weightKg: number;
  loggedAt: string;
}

interface WeightHistoryContextValue {
  entries: WeightEntry[];
  addEntry: (weightKg: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = '@nutrascan_weight_history';

const WeightHistoryContext = createContext<WeightHistoryContextValue>({
  entries: [],
  addEntry: async () => {},
  clearHistory: async () => {},
});

export function WeightHistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setEntries(JSON.parse(raw));
    });
  }, []);

  const persist = async (next: WeightEntry[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
  };

  const addEntry = useCallback(async (weightKg: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = entries.filter((e) => e.date !== today);
    await persist([
      ...existing,
      { date: today, weightKg, loggedAt: new Date().toISOString() },
    ].slice(-90)); // keep last 90 days
  }, [entries]);

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return (
    <WeightHistoryContext.Provider value={{ entries, addEntry, clearHistory }}>
      {children}
    </WeightHistoryContext.Provider>
  );
}

export function useWeightHistory() {
  return useContext(WeightHistoryContext);
}
