import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLF_C02 } from '@/data/exams/clf-c02';
import {
  loadReminderSettings,
  saveReminderSettings,
  type ReminderSettings,
} from '@/data/reminder-settings';
import { useRepository } from '@/db/use-repository';
import type { ReminderTime } from '@/logic/reminder-time';
import {
  cancelDailyReminder,
  requestReminderPermission,
  scheduleDailyReminder,
  sendTestReminder,
} from '@/notifications/daily-reminder';
import { useExamSession } from '@/state/exam-session';
import { usePracticeSession } from '@/state/practice-session';

type Notice = 'denied' | 'failed' | 'test-sent' | 'reset-done' | null;

function toDate(time: ReminderTime): Date {
  const date = new Date();
  date.setHours(time.hour, time.minute, 0, 0);
  return date;
}

const displayTime = (time: ReminderTime) =>
  toDate(time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text
        accessibilityRole="header"
        className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {props.title}
      </Text>
      <View className="gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        {props.children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const repo = useRepository();
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadReminderSettings(repo)
      .then((loaded) => {
        if (!cancelled) setSettings(loaded);
      })
      .catch(() => {
        if (!cancelled) setNotice('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  /** Applies new reminder settings to the system schedule, then stores them. */
  const apply = async (next: ReminderSettings) => {
    setBusy(true);
    setNotice(null);
    try {
      if (next.enabled) {
        const permission = await requestReminderPermission();
        if (!permission.granted) {
          setNotice('denied');
          next = { ...next, enabled: false };
        } else {
          await scheduleDailyReminder(next.time);
        }
      }
      if (!next.enabled) {
        await cancelDailyReminder();
      }
      await saveReminderSettings(repo, next);
      setSettings(next);
    } catch {
      setNotice('failed');
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset all progress?',
      'This deletes your answer history, review schedule and mock exam results. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            repo
              .resetProgress(CLF_C02.id)
              .then(() => {
                usePracticeSession.getState().start([]);
                useExamSession.setState({
                  attempt: null,
                  questions: [],
                  index: 0,
                  responses: {},
                  flagged: [],
                });
                setNotice('reset-done');
              })
              .catch(() => setNotice('failed'));
          },
        },
      ],
    );
  };

  if (!settings) {
    return (
      <SafeAreaView
        edges={['bottom']}
        className="flex-1 items-center justify-center bg-white px-8 dark:bg-black"
      >
        {notice === 'failed' ? (
          <Text className="text-center text-lg text-slate-900 dark:text-slate-50">
            Settings could not be loaded.
          </Text>
        ) : (
          <ActivityIndicator size="large" accessibilityLabel="Loading settings" />
        )}
      </SafeAreaView>
    );
  }

  const picker = (
    <DateTimePicker
      mode="time"
      display={Platform.OS === 'ios' ? 'compact' : 'default'}
      value={toDate(settings.time)}
      disabled={busy}
      onValueChange={(_event, date) => {
        setPickerOpen(false);
        void apply({ ...settings, time: { hour: date.getHours(), minute: date.getMinutes() } });
      }}
      onDismiss={() => setPickerOpen(false)}
    />
  );

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-black">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <Section title="Daily reminder">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-900 dark:text-slate-50">
                Remind me to study
              </Text>
              <Text className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                One notification a day. Tapping it opens Due today.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Remind me to study"
              value={settings.enabled}
              disabled={busy}
              onValueChange={(enabled) => void apply({ ...settings, enabled })}
            />
          </View>

          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-base font-medium text-slate-900 dark:text-slate-50">Time</Text>
            {Platform.OS === 'ios' ? (
              picker
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reminder time, ${displayTime(settings.time)}`}
                accessibilityHint="Opens the time picker"
                disabled={busy}
                onPress={() => setPickerOpen(true)}
                className="rounded-xl bg-slate-200 px-4 py-2 active:opacity-70 dark:bg-slate-800"
              >
                <Text className="text-base font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                  {displayTime(settings.time)}
                </Text>
              </Pressable>
            )}
          </View>
          {Platform.OS !== 'ios' && pickerOpen && picker}

          {notice === 'denied' && (
            <View className="gap-3 rounded-xl bg-amber-100 p-4 dark:bg-amber-950">
              <Text className="text-sm leading-5 text-amber-900 dark:text-amber-200">
                Notifications are turned off for CloudPrep, so the reminder cannot be shown. Turn
                them on in system settings, then switch the reminder on again.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void Linking.openSettings()}
                className="self-start rounded-xl bg-amber-700 px-4 py-2 active:opacity-70"
              >
                <Text className="text-sm font-semibold text-white">Open system settings</Text>
              </Pressable>
            </View>
          )}

          {settings.enabled && (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => {
                sendTestReminder()
                  .then(() => setNotice('test-sent'))
                  .catch(() => setNotice('failed'));
              }}
              className="self-start py-1 active:opacity-60"
            >
              <Text className="text-base font-medium text-sky-700 dark:text-sky-400">
                Send a test reminder
              </Text>
            </Pressable>
          )}
          {notice === 'test-sent' && (
            <Text
              accessibilityLiveRegion="polite"
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              A test reminder will arrive in about 5 seconds.
            </Text>
          )}
        </Section>

        <Section title="Your data">
          <Text className="text-sm leading-5 text-slate-600 dark:text-slate-400">
            All progress is stored on this device only.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={confirmReset}
            className="min-h-12 items-center justify-center rounded-xl border-2 border-rose-500 py-2 active:opacity-70 dark:border-rose-400"
          >
            <Text className="text-base font-semibold text-rose-700 dark:text-rose-400">
              Reset progress
            </Text>
          </Pressable>
          {notice === 'reset-done' && (
            <Text
              accessibilityLiveRegion="polite"
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              Your progress has been reset.
            </Text>
          )}
        </Section>

        {notice === 'failed' && (
          <Text className="text-sm text-rose-700 dark:text-rose-400">
            Something went wrong. Try again.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
