import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Rappels nutritionnels',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMealReminders(enabled: boolean): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Lunch reminder — 12:30
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚡ RAPPORT NUTRITIONNEL',
      body: 'Capitaine, avez-vous enregistré votre déjeuner ? Maintenez le cap.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 12, minute: 30 },
  });

  // Evening check-in — 20:00
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '◈ BILAN DU JOUR',
      body: 'Consultez votre progression et atteignez vos objectifs nutritionnels.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
  });
}
