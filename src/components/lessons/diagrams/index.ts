import type { ComponentType } from 'react';

import { ResponsibilityByService } from '@/components/lessons/diagrams/responsibility-by-service';
import { S3Lifecycle } from '@/components/lessons/diagrams/s3-lifecycle';
import { DIAGRAM_DESCRIPTIONS } from '@/content/diagram-descriptions';

export type Diagram = {
  Component: ComponentType;
  /** Read by screen readers instead of the drawing. */
  description: string;
};

const COMPONENTS: Record<string, ComponentType> = {
  'responsibility-by-service': ResponsibilityByService,
  's3-lifecycle': S3Lifecycle,
};

/** Diagrams that lessons can place with {{diagram:<id>}}. */
export const DIAGRAMS: Record<string, Diagram> = Object.fromEntries(
  Object.entries(COMPONENTS).map(([id, Component]) => [
    id,
    { Component, description: DIAGRAM_DESCRIPTIONS[id] ?? '' },
  ]),
);
