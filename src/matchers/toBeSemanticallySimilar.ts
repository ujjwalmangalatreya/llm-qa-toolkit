import { expect } from '@playwright/test';
import { embed } from '../clients/gemini.js';
import { cosineSimilarity } from '../utils/similarity.js';

const DEFAULT_THRESHOLD = Number(process.env.SIMILARITY_THRESHOLD ?? '0.75');

export interface SemanticSimilarityOptions {
  /**
   * Minimum cosine similarity required to pass (0.0 - 1.0).
   * Defaults to SIMILARITY_THRESHOLD env var, or 0.75.
   */
  threshold?: number;
}

/**
 * Custom Playwright matcher: passes when `received` is semantically similar
 * to `expected` according to embedding cosine similarity.
 *
 * Usage:
 *   await expect(answer).toBeSemanticallySimilar('Paris is the capital of France');
 *   await expect(answer).toBeSemanticallySimilar('...', { threshold: 0.9 });
 */
expect.extend({
  async toBeSemanticallySimilar(
    received: string,
    expected: string,
    options: SemanticSimilarityOptions = {}
  ) {
    const threshold = options.threshold ?? DEFAULT_THRESHOLD;

    if (typeof received !== 'string' || typeof expected !== 'string') {
      return {
        pass: false,
        message: () =>
          `toBeSemanticallySimilar requires two strings — got ${typeof received} and ${typeof expected}`,
      };
    }

    let score: number;
    try {
      const [vReceived, vExpected] = await embed(
        [received, expected],
        'SEMANTIC_SIMILARITY'
      );
      score = cosineSimilarity(vReceived, vExpected);
    } catch (err) {
      return {
        pass: false,
        message: () =>
          `toBeSemanticallySimilar failed to compute embeddings: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    const pass = score >= threshold;

    return {
      pass,
      message: () =>
        pass
          ? `Expected strings NOT to be semantically similar (threshold ${threshold}), but cosine similarity was ${score.toFixed(4)}.\n` +
            `  received: ${truncate(received)}\n` +
            `  expected: ${truncate(expected)}`
          : `Expected strings to be semantically similar (threshold ${threshold}), but cosine similarity was only ${score.toFixed(4)}.\n` +
            `  received: ${truncate(received)}\n` +
            `  expected: ${truncate(expected)}`,
    };
  },
});

function truncate(s: string, max = 200): string {
  return s.length <= max ? s : s.slice(0, max) + '…';
}

declare module '@playwright/test' {
  interface Matchers<R, _T = unknown> {
    toBeSemanticallySimilar(expected: string, options?: SemanticSimilarityOptions): Promise<R>;
  }
}
