import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

const AD_UNIT_IDS = {
  android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ?? 'ca-app-pub-3940256099942544/1033173712',
  ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS ?? 'ca-app-pub-3940256099942544/4411468910',
  default: 'ca-app-pub-3940256099942544/1033173712',
};

const adUnitId = Platform.select(AD_UNIT_IDS) as string;

export function useInterstitial() {
  const ad = useRef(InterstitialAd.createForAdRequest(adUnitId));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onLoad = ad.current.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const onClose = ad.current.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      ad.current.load();
    });
    const onError = ad.current.addAdEventListener(AdEventType.ERROR, () => setLoaded(false));

    ad.current.load();

    return () => {
      onLoad();
      onClose();
      onError();
    };
  }, []);

  const showAd = useCallback((): boolean => {
    if (!loaded) return false;
    ad.current.show();
    return true;
  }, [loaded]);

  return { showAd, isLoaded: loaded };
}
