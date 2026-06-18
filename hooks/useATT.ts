import { useEffect } from 'react';
import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import MobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

export function useATT() {
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        await requestTrackingPermissionsAsync();
      }
      await MobileAds().initialize();
      await MobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });
    })();
  }, []);
}
