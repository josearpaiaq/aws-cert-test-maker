import type { ComponentType } from 'react';

import {
  RESPONSIBILITY_DESCRIPTION,
  ResponsibilityByService,
} from '@/components/lessons/diagrams/responsibility-by-service';
import { S3_LIFECYCLE_DESCRIPTION, S3Lifecycle } from '@/components/lessons/diagrams/s3-lifecycle';

export type Diagram = {
  Component: ComponentType;
  /** Read by screen readers instead of the drawing. */
  description: string;
};

/** Diagrams that lessons can place with {{diagram:<id>}}. */
export const DIAGRAMS: Record<string, Diagram> = {
  'responsibility-by-service': {
    Component: ResponsibilityByService,
    description: RESPONSIBILITY_DESCRIPTION,
  },
  's3-lifecycle': { Component: S3Lifecycle, description: S3_LIFECYCLE_DESCRIPTION },
};
