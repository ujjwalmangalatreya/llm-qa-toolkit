import { expect } from '@playwright/test';
import { judgeGrounding } from '../clients/judge.js';

export interface Snippet {
  chunkId: string;
  text: string;
}

expect.extend({
  async toBeGroundedIn(received: string, snippets: Snippet[]) {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `toBeGroundedIn expected a string, got ${typeof received}`,
      };
    }
    if (!Array.isArray(snippets) || snippets.length === 0) {
      return {
        pass: false,
        message: () => `toBeGroundedIn requires a non-empty array of snippets`,
      };
    }

    let verdict;
    try {
      verdict = await judgeGrounding(received, snippets);
    } catch (err) {
      return {
        pass: false,
        message: () =>
          `Grounding judge failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    return {
      pass: verdict.grounded,
      message: () =>
        verdict.grounded
          ? `Expected answer NOT to be grounded, but the judge marked every claim as supported.`
          : `Answer was not grounded. Unsupported claims:\n${verdict.unsupportedClaims
              .map((c) => `  - ${c}`)
              .join('\n')}`,
    };
  },
});

declare module '@playwright/test' {
  interface Matchers<R, _T = unknown> {
    toBeGroundedIn(snippets: Snippet[]): Promise<R>;
  }
}
