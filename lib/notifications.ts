import { Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('noteflow-reminders', {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#6366F1',
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: current } = await Notifications.getPermissionsAsync();

  if (current === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();

  return status === 'granted';
}

export function promptOpenSettings(): void {
  Alert.alert(
    'Permisos necesarios',
    'Las notificaciones están desactivadas. Abre los ajustes de la app para habilitarlas.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => void Linking.openSettings() },
    ]
  );
}

export async function scheduleReminder(
  noteId: string,
  title: string,
  triggerDate: Date
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'NoteFlow · Recordatorio',
        body: title,
        data: { noteId },
        ...(Platform.OS === 'android' && { channelId: 'noteflow-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function cancelReminder(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function buildReminderDate(preset: ReminderPreset): Date {
  const now = new Date();

  switch (preset) {
    case '1h': {
      return new Date(now.getTime() + 60 * 60 * 1000);
    }
    case 'tonight': {
      const tonight = new Date(now);
      tonight.setHours(20, 0, 0, 0);
      if (tonight <= now) tonight.setDate(tonight.getDate() + 1);
      return tonight;
    }
    case 'tomorrow': {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    }
    case '1week': {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}

export type ReminderPreset = '1h' | 'tonight' | 'tomorrow' | '1week';

export const REMINDER_PRESETS: Array<{ label: string; value: ReminderPreset }> = [
  { label: 'En 1 hora', value: '1h' },
  { label: 'Esta noche (20:00)', value: 'tonight' },
  { label: 'Mañana (09:00)', value: 'tomorrow' },
  { label: 'En 1 semana', value: '1week' },
];
