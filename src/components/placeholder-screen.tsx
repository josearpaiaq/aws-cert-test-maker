import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-2 bg-white px-6 dark:bg-black">
      <Text
        maxFontSizeMultiplier={1.3}
        className="text-3xl font-bold text-slate-900 dark:text-slate-50"
      >
        {title}
      </Text>
      <Text className="text-center text-base text-slate-600 dark:text-slate-400">{subtitle}</Text>
    </SafeAreaView>
  );
}
