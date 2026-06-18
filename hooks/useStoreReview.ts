import { useCallback, useEffect, useRef } from 'react';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_COUNT_KEY = '@nutrascan_scan_count';
const REVIEW_ASKED_KEY = '@nutrascan_review_asked';
const REVIEW_THRESHOLD = 5;

export function useStoreReview() {
  const prompted = useRef(false);

  const recordScan = useCallback(async () => {
    const [rawCount, alreadyAsked] = await Promise.all([
      AsyncStorage.getItem(SCAN_COUNT_KEY),
      AsyncStorage.getItem(REVIEW_ASKED_KEY),
    ]);

    if (alreadyAsked === 'true' || prompted.current) return;

    const count = (parseInt(rawCount ?? '0', 10) || 0) + 1;
    await AsyncStorage.setItem(SCAN_COUNT_KEY, String(count));

    if (count >= REVIEW_THRESHOLD) {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        prompted.current = true;
        await AsyncStorage.setItem(REVIEW_ASKED_KEY, 'true');
        await StoreReview.requestReview();
      }
    }
  }, []);

  return { recordScan };
}
