import { Text, View } from 'react-native';

type Owner = 'you' | 'aws';

const LAYERS = [
  'Data and access',
  'Application',
  'Operating system and patches',
  'Infrastructure and hardware',
];
const SERVICES: { name: string; owners: Owner[] }[] = [
  { name: 'EC2', owners: ['you', 'you', 'you', 'aws'] },
  { name: 'RDS', owners: ['you', 'aws', 'aws', 'aws'] },
  { name: 'Lambda', owners: ['you', 'you', 'aws', 'aws'] },
];

const CELL: Record<Owner, string> = {
  you: 'bg-sky-100 dark:bg-sky-950',
  aws: 'bg-amber-100 dark:bg-amber-950',
};
const CELL_TEXT: Record<Owner, string> = {
  you: 'text-sky-900 dark:text-sky-200',
  aws: 'text-amber-900 dark:text-amber-200',
};

export const RESPONSIBILITY_DESCRIPTION =
  'Who manages each layer. EC2: you manage data and access, the application, and the operating system; AWS manages the infrastructure. RDS: you manage data and access; AWS manages the database software, operating system and infrastructure. Lambda: you manage data and access and your code; AWS manages the operating system and infrastructure.';

/** A grid of layers by service, each cell labelled with its owner so it isn't colour-only. */
export function ResponsibilityByService() {
  return (
    <View className="gap-1">
      <View className="flex-row gap-1">
        <View className="flex-[1.4]" />
        {SERVICES.map((service) => (
          <Text
            key={service.name}
            className="flex-1 text-center text-sm font-semibold text-slate-900 dark:text-slate-50"
          >
            {service.name}
          </Text>
        ))}
      </View>
      {LAYERS.map((layer, row) => (
        <View key={layer} className="flex-row gap-1">
          <Text className="flex-[1.4] self-center pr-1 text-sm text-slate-700 dark:text-slate-300">
            {layer}
          </Text>
          {SERVICES.map((service) => {
            const owner = service.owners[row];
            return (
              <View
                key={service.name}
                className={`min-h-11 flex-1 items-center justify-center rounded-lg ${CELL[owner]}`}
              >
                <Text className={`text-sm font-semibold ${CELL_TEXT[owner]}`}>
                  {owner === 'you' ? 'You' : 'AWS'}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
