import { Pressable, Text, View } from 'react-native';

import type { QuestionOption } from '@/data/question-schema';

export type OptionStatus = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const CONTAINER: Record<OptionStatus, string> = {
  idle: 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
  selected: 'border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950',
  correct: 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950',
  wrong: 'border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-950',
  dimmed: 'border-slate-200 bg-white opacity-70 dark:border-slate-800 dark:bg-slate-900',
};

const BADGE: Record<OptionStatus, string> = {
  idle: 'bg-slate-100 dark:bg-slate-800',
  selected: 'bg-sky-700 dark:bg-sky-400',
  correct: 'bg-emerald-700 dark:bg-emerald-400',
  wrong: 'bg-rose-700 dark:bg-rose-400',
  dimmed: 'bg-slate-100 dark:bg-slate-800',
};

const BADGE_TEXT: Record<OptionStatus, string> = {
  idle: 'text-slate-700 dark:text-slate-200',
  selected: 'text-white dark:text-slate-950',
  correct: 'text-white dark:text-slate-950',
  wrong: 'text-white dark:text-slate-950',
  dimmed: 'text-slate-700 dark:text-slate-200',
};

/** Spoken after the option text once the answer is revealed, so the result is not colour-only. */
const STATUS_LABEL: Partial<Record<OptionStatus, string>> = {
  correct: 'Correct answer',
  wrong: 'Your answer, incorrect',
};

type OptionRowProps = {
  option: QuestionOption;
  status: OptionStatus;
  multiple: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function OptionRow({ option, status, multiple, disabled, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: status === 'selected', disabled }}
      accessibilityLabel={[`${option.id.toUpperCase()}. ${option.text}`, STATUS_LABEL[status]]
        .filter(Boolean)
        .join('. ')}
      testID={`option-${option.id}`}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-14 flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3 active:opacity-70 ${CONTAINER[status]}`}
    >
      <View className={`h-8 w-8 items-center justify-center rounded-full ${BADGE[status]}`}>
        <Text maxFontSizeMultiplier={1.4} className={`text-sm font-bold ${BADGE_TEXT[status]}`}>
          {option.id.toUpperCase()}
        </Text>
      </View>
      <Text className="flex-1 text-base leading-6 text-slate-900 dark:text-slate-50">
        {option.text}
      </Text>
    </Pressable>
  );
}
