import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { DIAGRAMS } from '@/components/lessons/diagrams';
import { plainText, type Block, type CalloutKind, type Span } from '@/logic/lesson-markdown';

function Spans({ spans }: { spans: Span[] }) {
  return spans.map((span, index) =>
    span.bold ? (
      <Text key={index} className="font-semibold text-slate-900 dark:text-slate-50">
        {span.text}
      </Text>
    ) : (
      <Fragment key={index}>{span.text}</Fragment>
    ),
  );
}

const BODY = 'text-base leading-7 text-slate-700 dark:text-slate-300';

const CALLOUT: Record<CalloutKind, { label: string; box: string; title: string }> = {
  tip: {
    label: 'Tip',
    box: 'border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950',
    title: 'text-emerald-800 dark:text-emerald-300',
  },
  note: {
    label: 'Note',
    box: 'border-sky-600 bg-sky-50 dark:border-sky-400 dark:bg-sky-950',
    title: 'text-sky-800 dark:text-sky-300',
  },
  exam: {
    label: 'On the exam',
    box: 'border-amber-600 bg-amber-50 dark:border-amber-400 dark:bg-amber-950',
    title: 'text-amber-900 dark:text-amber-300',
  },
};

/**
 * Tables with more than two columns become one card per row, so wide comparisons stay readable
 * on a phone; two-column tables stay as rows.
 */
function Table({ block }: { block: Extract<Block, { type: 'table' }> }) {
  if (block.header.length <= 2) {
    return (
      <View className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        {[block.header, ...block.rows].map((row, index) => (
          <View
            key={index}
            className={`flex-row gap-3 px-4 py-3 ${index === 0 ? 'bg-slate-100 dark:bg-slate-900' : 'border-t border-slate-200 dark:border-slate-800'}`}
          >
            {row.map((cell, column) => (
              <Text
                key={column}
                className={`flex-1 text-base ${index === 0 ? 'font-semibold text-slate-900 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300'}`}
              >
                <Spans spans={cell} />
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="gap-3">
      {block.rows.map((row, index) => (
        <View
          key={index}
          className="gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Text className="text-base font-semibold text-slate-900 dark:text-slate-50">
            <Spans spans={row[0] ?? []} />
          </Text>
          {row.slice(1).map((cell, column) => (
            <View key={column} className="gap-0.5">
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {plainText(block.header[column + 1] ?? [])}
              </Text>
              <Text className="text-base leading-6 text-slate-700 dark:text-slate-300">
                <Spans spans={cell} />
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text
          accessibilityRole="header"
          className={
            block.level === 2
              ? 'mt-4 text-xl font-bold text-slate-900 dark:text-slate-50'
              : 'mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50'
          }
        >
          <Spans spans={block.spans} />
        </Text>
      );
    case 'paragraph':
      return (
        <Text className={BODY}>
          <Spans spans={block.spans} />
        </Text>
      );
    case 'list':
      return (
        <View className="gap-2">
          {block.items.map((item, index) => (
            <View key={index} className="flex-row gap-3">
              <Text className={`${BODY} min-w-5 text-right`}>
                {block.ordered ? `${index + 1}.` : '•'}
              </Text>
              <Text className={`${BODY} flex-1`}>
                <Spans spans={item} />
              </Text>
            </View>
          ))}
        </View>
      );
    case 'table':
      return <Table block={block} />;
    case 'callout': {
      const style = CALLOUT[block.kind];
      return (
        <View
          accessible
          accessibilityLabel={`${style.label}. ${plainText(block.spans)}`}
          className={`gap-1 rounded-xl border-l-4 p-4 ${style.box}`}
        >
          <Text className={`text-sm font-bold uppercase tracking-wide ${style.title}`}>
            {style.label}
          </Text>
          <Text className="text-base leading-6 text-slate-800 dark:text-slate-200">
            <Spans spans={block.spans} />
          </Text>
        </View>
      );
    }
    case 'diagram': {
      const diagram = DIAGRAMS[block.id];
      if (!diagram) return null;
      return (
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={diagram.description}
          className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
        >
          <diagram.Component />
        </View>
      );
    }
  }
}

export function LessonContent({ blocks }: { blocks: Block[] }) {
  return (
    <View className="gap-4">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </View>
  );
}
