import { Linking, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OptionRow, type OptionStatus } from '@/components/practice/option-row';
import type { Question } from '@/data/question-schema';

function optionStatus(
  question: Question,
  optionId: string,
  selected: readonly string[],
  revealed: boolean,
): OptionStatus {
  const isSelected = selected.includes(optionId);
  if (!revealed) return isSelected ? 'selected' : 'idle';
  if (question.correct.includes(optionId)) return 'correct';
  return isSelected ? 'wrong' : 'dimmed';
}

type QuestionCardProps = {
  question: Question;
  selected: readonly string[];
  revealed: boolean;
  /** Whether the revealed answer was right. Ignored until `revealed`. */
  wasCorrect: boolean;
  onToggleOption: (optionId: string) => void;
};

export function QuestionCard({
  question,
  selected,
  revealed,
  wasCorrect,
  onToggleOption,
}: QuestionCardProps) {
  return (
    <View className="gap-5">
      <Text
        accessibilityRole="header"
        className="text-xl font-semibold leading-7 text-slate-900 dark:text-slate-50"
      >
        {question.prompt}
      </Text>

      <View
        accessibilityRole={question.type === 'single' ? 'radiogroup' : undefined}
        className="gap-3"
      >
        {question.options.map((option) => (
          <OptionRow
            key={option.id}
            option={option}
            status={optionStatus(question, option.id, selected, revealed)}
            multiple={question.type === 'multi'}
            disabled={revealed}
            onPress={() => onToggleOption(option.id)}
          />
        ))}
      </View>

      {revealed && (
        <Animated.View entering={FadeInDown.duration(250)} className="gap-3">
          <View
            accessibilityLiveRegion="polite"
            className={`rounded-2xl px-4 py-3 ${
              wasCorrect ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-rose-100 dark:bg-rose-950'
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                wasCorrect
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {wasCorrect ? 'Correct' : 'Not quite'}
            </Text>
          </View>
          <Text className="text-base leading-6 text-slate-700 dark:text-slate-300">
            {question.explanation}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL(question.source)}
            className="self-start py-2 active:opacity-60"
          >
            <Text className="text-base font-medium text-sky-700 dark:text-sky-400">
              Read the AWS documentation
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
