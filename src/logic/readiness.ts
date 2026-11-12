/** How many of a domain's most recent answers the readiness check looks at. */
export const READINESS_WINDOW = 50;
/** The accuracy every domain must reach over that window. */
export const READINESS_THRESHOLD = 0.8;

export type DomainReadiness = {
  domain: number;
  /** Answers counted for this domain, at most the window size. */
  answered: number;
  correct: number;
  /** Accuracy over the counted answers, or null when the domain has no answers yet. */
  accuracy: number | null;
  /** True when the window is full and accuracy is at or above the threshold. */
  ready: boolean;
};

export type Readiness = {
  /** True when the exam has at least one domain and every domain is ready. */
  ready: boolean;
  domains: DomainReadiness[];
};

/**
 * Per-domain readiness from answer history. `answers` must be ordered most recent first;
 * only the latest `window` answers in each domain count. A domain with fewer answers than
 * the window is not ready, however accurate it is, so a short lucky streak cannot trigger
 * the "ready to book?" indicator.
 */
export function computeReadiness(
  answers: readonly { domain: number; isCorrect: boolean }[],
  domainIds: readonly number[],
  options: { window: number; threshold: number } = {
    window: READINESS_WINDOW,
    threshold: READINESS_THRESHOLD,
  },
): Readiness {
  const domains = domainIds.map((domain): DomainReadiness => {
    const recent = answers.filter((a) => a.domain === domain).slice(0, options.window);
    const correct = recent.filter((a) => a.isCorrect).length;
    const accuracy = recent.length === 0 ? null : correct / recent.length;
    return {
      domain,
      answered: recent.length,
      correct,
      accuracy,
      ready: recent.length >= options.window && accuracy !== null && accuracy >= options.threshold,
    };
  });

  return { ready: domains.length > 0 && domains.every((d) => d.ready), domains };
}
