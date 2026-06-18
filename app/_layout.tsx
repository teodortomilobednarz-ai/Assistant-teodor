import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  useFonts,
  Orbitron_700Bold,
  Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';
import { UserProvider } from '../store/UserContext';
import { PremiumProvider } from '../store/PremiumContext';
import { DailyLogProvider } from '../store/DailyLogContext';
import { useATT } from '../hooks/useATT';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  useATT();

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="scan-result"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="body-fat"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="subscription"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Orbitron_700Bold,
    Orbitron_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <UserProvider>
      <PremiumProvider>
        <DailyLogProvider>
          <AppShell />
        </DailyLogProvider>
      </PremiumProvider>
    </UserProvider>
  );
}
