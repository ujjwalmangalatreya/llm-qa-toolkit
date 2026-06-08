import { expect } from '@playwright/test';

const CITATION_RE = /\[([a-z0-9\-]+#\d+)\]/gi;

export function extractCitations(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(CITATION_RE)) out.add(m[1]);
  return [...out];
}

expect.extend({
  toHaveValidCitations(received: string, snippets: { chunkId: string }[]) {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `toHaveValidCitations expected a string, got ${typeof received}`,
      };
    }

    const cited = extractCitations(received);
    if (cited.length === 0) {
      return {
        pass: false,
        message: () => `Answer contains no citations in [chunkId] format.`,
      };
    }

    const known = new Set(snippets.map((s) => s.chunkId));
    const invalid = cited.filter((c) => !known.has(c));

    return {
      pass: invalid.length === 0,
      message: () =>
        invalid.length === 0
          ? `Expected answer to have invalid citations, but all ${cited.length} citation(s) resolved.`
          : `Answer cites unknown chunkId(s): ${invalid.join(', ')}.\nValid chunkIds were: ${[...known].join(', ')}`,
    };
  },
});

declare module '@playwright/test' {
  interface Matchers<R, _T = unknown> {
    toHaveValidCitations(snippets: { chunkId: string }[]): R;
  }
}
