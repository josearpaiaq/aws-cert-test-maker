import { Text, useColorScheme, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const STAGES = [
  { label: 'S3 Standard', detail: 'Day 0' },
  { label: 'S3 Standard-IA', detail: 'After 30 days' },
  { label: 'S3 Glacier Flexible Retrieval', detail: 'After 90 days' },
  { label: 'Deleted', detail: 'After 365 days' },
];

export const S3_LIFECYCLE_DESCRIPTION =
  'Example lifecycle rule: objects start in S3 Standard, move to S3 Standard-IA after 30 days, to S3 Glacier Flexible Retrieval after 90 days, and are deleted after 365 days.';

function Arrow({ color }: { color: string }) {
  return (
    <Svg width={24} height={22} viewBox="0 0 24 22">
      <Path
        d="M12 2 V18 M5 12 L12 19 L19 12"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A vertical timeline of storage classes joined by arrows. */
export function S3Lifecycle() {
  const arrowColor = useColorScheme() === 'dark' ? '#94a3b8' : '#64748b';
  return (
    <View className="items-center gap-1">
      {STAGES.map((stage, index) => (
        <View key={stage.label} className="w-full items-center gap-1">
          {index > 0 && <Arrow color={arrowColor} />}
          <View className="w-full flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <Text className="flex-1 text-base font-semibold text-slate-900 dark:text-slate-50">
              {stage.label}
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">{stage.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
