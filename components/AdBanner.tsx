import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePremium } from '../store/PremiumContext';

const AD_UNIT_IDS = {
  android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID ?? 'ca-app-pub-3940256099942544/6300978111',
  ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS ?? 'ca-app-pub-3940256099942544/2934735716',
  default: 'ca-app-pub-3940256099942544/6300978111',
};

const adUnitId = Platform.select(AD_UNIT_IDS) as string;

export function AdBanner() {
  const { isPremium } = usePremium();
  if (isPremium) return null;

  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />
    </View>
  );
}
