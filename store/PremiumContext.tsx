import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import type { Purchase, PurchaseError } from 'react-native-iap';
import {
  initIAP,
  closeIAP,
  purchaseMonthly,
  purchaseYearly,
  restorePurchases,
  setupPurchaseListeners,
  ErrorCode,
} from '../services/iap';

const PREMIUM_KEY = '@nutrascan_premium_status';

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  subscribe: (plan?: 'monthly' | 'yearly') => Promise<void>;
  restore: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  isLoading: true,
  isPurchasing: false,
  subscribe: async () => {},
  restore: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const iapReady = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PREMIUM_KEY);
        if (stored === 'true') setIsPremium(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      iapReady.current = await initIAP();

      cleanup = setupPurchaseListeners(
        async (_purchase: Purchase) => {
          await AsyncStorage.setItem(PREMIUM_KEY, 'true');
          setIsPremium(true);
          setIsPurchasing(false);
        },
        (error: PurchaseError) => {
          setIsPurchasing(false);
          if (error.code !== ErrorCode.UserCancelled) {
            Alert.alert(
              'Erreur de paiement',
              error.message ?? 'Une erreur est survenue. Réessayez.',
              [{ text: 'OK' }]
            );
          }
        }
      );
    })();

    return () => {
      cleanup?.();
      closeIAP();
    };
  }, []);

  const subscribe = useCallback(async (plan: 'monthly' | 'yearly' = 'monthly') => {
    if (!iapReady.current) {
      Alert.alert('Non disponible', 'Les achats intégrés ne sont pas disponibles sur cet appareil.');
      return;
    }
    setIsPurchasing(true);
    try {
      if (plan === 'yearly') {
        await purchaseYearly();
      } else {
        await purchaseMonthly();
      }
    } catch {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsPurchasing(true);
    try {
      const found = await restorePurchases();
      if (found) {
        await AsyncStorage.setItem(PREMIUM_KEY, 'true');
        setIsPremium(true);
        Alert.alert('Abonnement restauré', 'Votre accès Premium est actif.');
      } else {
        Alert.alert(
          'Aucun abonnement trouvé',
          'Aucun achat actif trouvé sur ce compte App Store / Google Play.'
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, isPurchasing, subscribe, restore }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
