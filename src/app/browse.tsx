import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import type { Question } from '@/data/question-schema';

type Row = { key: string; question: Question };

/** The most copies of the bank the `repeat` benchmark parameter may request. */
const MAX_REPEAT = 25;

function QuestionRow({
  question,
  expanded,
  onToggle,
}: {
  question: Question;
  expanded: boolean;
  onToggle: () => void;
}) {
  const domain = CLF_C02.domains.find((d) => d.id === question.domain);
  const answers = question.options.filter((o) => question.correct.includes(o.id));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityHint={expanded ? 'Hides the answer' : 'Shows the answer and explanation'}
      onPress={onToggle}
      className="mx-5 mb-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 active:opacity-70 dark:border-slate-800 dark:bg-slate-900"
    >
      <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Domain {question.domain} · {domain?.name} · {question.taskStatement}
      </Text>
      <Text className="text-base leading-6 text-slate-900 dark:text-slate-50">
        {question.prompt}
      </Text>
      {expanded && (
        <View className="gap-2 pt-1">
          {answers.map((answer) => (
            <Text
              key={answer.id}
              className="text-base font-semibold text-emerald-800 dark:text-emerald-300"
            >
              ✓ {answer.text}
            </Text>
          ))}
          <Text className="text-sm leading-5 text-slate-700 dark:text-slate-300">
            {question.explanation}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Every question in the bank. `?repeat=N` lists the bank N times over; it exists only to
 * measure scrolling with a 500-question list before the real bank is that large.
 */
export default function BrowseScreen() {
  const { repeat } = useLocalSearchParams<{ repeat?: string }>();
  const [expanded, setExpanded] = useState<string | null>(null);

  const copies = Math.min(MAX_REPEAT, Math.max(1, Number(repeat) || 1));
  const bank = getQuestionBank();
  const rows: Row[] = Array.from({ length: copies }, (_, copy) =>
    bank.map((question) => ({ key: `${copy}-${question.id}`, question })),
  ).flat();

  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      data={rows}
      keyExtractor={(row) => row.key}
      extraData={expanded}
      renderItem={({ item }) => (
        <QuestionRow
          question={item.question}
          expanded={expanded === item.key}
          onToggle={() => setExpanded((current) => (current === item.key ? null : item.key))}
        />
      )}
      ListHeaderComponent={
        <Text className="px-5 pb-3 pt-4 text-sm text-slate-600 dark:text-slate-400">
          {rows.length} questions{copies > 1 ? ` (the bank repeated ${copies} times)` : ''}. Tap one
          to see its answer.
        </Text>
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
}
