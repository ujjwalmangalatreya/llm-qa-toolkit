import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DocsBot } from '../../src/docsbot/index.js';
import '../../src/matchers/index.js';

interface EvalCase {
  id: string;
  question: string;
  expected: string;
  expectedDocId: string;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const evalSet: EvalCase[] = JSON.parse(
  readFileSync(path.join(here, 'eval-set.json'), 'utf-8')
);

const bot = new DocsBot();

test.beforeAll(async () => {
  await bot.init();
});

for (const c of evalSet) {
  test(`correctness: ${c.id}`, async () => {
    const { answer, retrievedChunks } = await bot.ask(c.question);

    expect(
      retrievedChunks.some((r) => r.docId === c.expectedDocId),
      `expected to retrieve from "${c.expectedDocId}", got [${retrievedChunks.map((r) => r.docId).join(', ')}]`
    ).toBeTruthy();

    await expect(answer).toBeSemanticallySimilar(c.expected, { threshold: 0.7 });
  });
}
