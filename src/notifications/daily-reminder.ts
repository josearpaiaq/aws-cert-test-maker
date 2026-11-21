import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import { planReminders, REMINDER_DAYS } from '@/logic/reminder-plan';
import type { ReminderTime } from '@/logic/reminder-time';
import type { Streak } from '@/logic/streak';

/**
 * Android decides whether a notification pops up as a banner from its channel's importance,
 * and an app cannot raise the importance of a channel it already created. The first channel
 * was created with default importance (no banner), so it is replaced by this one.
 */
const CHANNEL_ID = 'study-reminder';
const OLD_CHANNEL_ID = 'daily-reminder';
/** The repeating reminder of older versions, replaced by one-off reminders that name the streak. */
const OLD_REMINDER_ID = 'daily-reminder';
const reminderId = (index: number) => `daily-reminder-${index}`;

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
    await Notifications.deleteNotificationChannelAsync(OLD_CHANNEL_ID);
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily study reminder',
      importance: AndroidImportance.HIGH,
    });
  }

  let status = await Notifications.getPermissionsAsync();
  if (!isGranted(status) && status.canAskAgain) {
    status = await Notifications.requestPermissionsAsync();
  }
  return { granted: isGranted(status), canAskAgain: status.canAskAgain };
}

/**
 * Schedules a reminder for each of the next days at `time`, replacing any earlier schedule. The
 * texts depend on `streak`, so this runs again whenever the app is opened or left.
 */
export async function scheduleDailyReminder(time: ReminderTime, streak: Streak): Promise<void> {
  await cancelDailyReminder();
  const plan = planReminders(time, streak, Date.now());
  await Promise.all(
    plan.map((reminder, index) =>
      Notifications.scheduleNotificationAsync({
        identifier: reminderId(index),
        content: { title: reminder.title, body: reminder.body, data: { kind: REMINDER_KIND } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminder.at,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
}

export async function cancelDailyReminder(): Promise<void> {
  const ids = [OLD_REMINDER_ID, ...Array.from({ length: REMINDER_DAYS }, (_, i) => reminderId(i))];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
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
