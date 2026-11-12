import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderTime } from '@/logic/reminder-time';

const CHANNEL_ID = 'daily-reminder';
const REMINDER_ID = 'daily-reminder';

/** Marks a notification as the study reminder, so a tap on it opens the Due today queue. */
export const REMINDER_KIND = 'daily-reminder';

const content: Notifications.NotificationContentInput = {
  title: 'Time to study',
  body: 'Open CloudPrep to review the questions due today.',
  data: { kind: REMINDER_KIND },
};

function isGranted(status: Notifications.NotificationPermissionsStatus): boolean {
  return status.granted || status.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}

/**
 * Asks for permission to show notifications if it has not been decided yet. On Android 13+
 * the system prompt only appears once a channel exists, so the channel is created first.
 * `canAskAgain` is false when the learner has to change it in system settings.
 */
export async function requestReminderPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily study reminder',
      importance: AndroidImportance.DEFAULT,
    });
  }

  let status = await Notifications.getPermissionsAsync();
  if (!isGranted(status) && status.canAskAgain) {
    status = await Notifications.requestPermissionsAsync();
  }
  return { granted: isGranted(status), canAskAgain: status.canAskAgain };
}

/** Schedules the reminder to repeat every day at `time`, replacing any earlier schedule. */
export async function scheduleDailyReminder(time: ReminderTime): Promise<void> {
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
}

/** Shows the reminder once, a few seconds from now, to check that notifications work. */
export async function sendTestReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL_ID,
    },
  });
}
