import { Pressable, Text, View } from 'react-native';

import type { Question } from '@/data/question-schema';
import type { ExamResponses } from '@/db/repository';

type QuestionGridProps = {
  questions: readonly Question[];
  responses: ExamResponses;
  flagged: readonly string[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

/** Every question as a numbered cell, showing which are answered and which are flagged. */
export function QuestionGrid({
  questions,
  responses,
  flagged,
  currentIndex,
  onSelect,
}: QuestionGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {questions.map((question, index) => {
        const answered = (responses[question.id]?.length ?? 0) > 0;
        const isFlagged = flagged.includes(question.id);
        const label = [
          `Question ${index + 1}`,
          answered ? 'answered' : 'not answered',
          isFlagged ? 'flagged' : '',
        ]
          .filter(Boolean)
          .join(', ');

        return (
          <Pressable
            key={question.id}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: index === currentIndex }}
            testID={`grid-cell-${index + 1}`}
            onPress={() => onSelect(index)}
            className={`h-14 w-14 items-center justify-center rounded-xl border-2 active:opacity-70 ${
              answered
                ? 'border-sky-700 bg-sky-700 dark:border-sky-500 dark:bg-sky-500'
                : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
            } ${index === currentIndex ? 'border-slate-900 dark:border-white' : ''}`}
          >
            <Text
              maxFontSizeMultiplier={1.3}
              className={`text-base font-semibold ${
                answered ? 'text-white dark:text-slate-950' : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {index + 1}
            </Text>
            {isFlagged && (
              <View className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-amber-500 dark:border-black" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
