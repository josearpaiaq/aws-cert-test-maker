import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLF_C02 } from '@/data/exams/clf-c02';
import { WEAKEST_TARGET } from '@/data/practice-questions';
import { getQuestionBank } from '@/data/question-bank';

function startPractice(target: string) {
  void Haptics.selectionAsync();
  router.push({ pathname: '/practice', params: { target } });
}

export default function StudyScreen() {
  const bank = getQuestionBank();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-3 px-5 pb-8 pt-4"
      >
        <Text
          accessibilityRole="header"
          className="text-3xl font-bold text-slate-900 dark:text-slate-50"
        >
          Study
        </Text>
        <Text className="mb-2 text-base text-slate-600 dark:text-slate-400">
          {CLF_C02.name} · 10 questions per session
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityHint="Starts a practice session from the domains you score lowest in"
          onPress={() => startPractice(WEAKEST_TARGET)}
          className="rounded-2xl bg-sky-600 p-5 active:bg-sky-700"
        >
          <Text className="text-lg font-semibold text-white">Weakest areas</Text>
          <Text className="mt-1 text-base text-sky-100">
            Questions from the domains you score lowest in
          </Text>
        </Pressable>

        <Text className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Practice by domain
        </Text>

        {CLF_C02.domains.map((domain) => {
          const count = bank.filter((q) => q.domain === domain.id).length;
          return (
            <Pressable
              key={domain.id}
              accessibilityRole="button"
              accessibilityLabel={`Domain ${domain.id}, ${domain.name}`}
              accessibilityHint="Starts a practice session for this domain"
              onPress={() => startPractice(String(domain.id))}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 active:opacity-70 dark:border-slate-800 dark:bg-slate-900"
            >
              <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Domain {domain.id}
              </Text>
              <Text className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {domain.name}
              </Text>
              <Text className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {Math.round(domain.weight * 100)}% of the exam · {count} questions
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
