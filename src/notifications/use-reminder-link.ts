import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { DUE_TARGET } from '@/data/practice-questions';
import { REMINDER_KIND } from '@/notifications/daily-reminder';

// Show the reminder even when it fires while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Opens the Due today queue when the learner taps the study reminder, whether the app was
 * already running or was launched by the tap.
 */
export function useReminderLink() {
  useEffect(() => {
    let lastHandled: number | null = null;

    const open = (response: Notifications.NotificationResponse) => {
      const { date, request } = response.notification;
      // A cold start can deliver the same tap twice: once as the launch response and once
      // through the listener.
      if (request.content.data?.kind !== REMINDER_KIND || date === lastHandled) return;
      lastHandled = date;
      router.push({ pathname: '/practice', params: { target: DUE_TARGET } });
      void Notifications.clearLastNotificationResponseAsync();
    };

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) open(response);
    });
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, []);
}
