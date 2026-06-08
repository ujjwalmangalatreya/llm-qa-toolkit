import { test, expect } from '@playwright/test';
import { DocsBot } from '../../src/docsbot/index.js';
import '../../src/matchers/index.js';

test.describe('citations matcher (no LLM)', () => {
  test('flags fabricated citations as invalid', () => {
    const fake = 'Set fixture scope to worker [fixtures#42] and use the magic API [imaginary#0].';
    const known = [{ chunkId: 'fixtures#0' }, { chunkId: 'fixtures#1' }];

    expect(fake).not.toHaveValidCitations(known);
  });

  test('accepts answers where every citation resolves', () => {
    const ok = 'Use beforeEach [fixtures#1] and worker scope [fixtures#3].';
    const known = [
      { chunkId: 'fixtures#0' },
      { chunkId: 'fixtures#1' },
      { chunkId: 'fixtures#3' },
    ];

    expect(ok).toHaveValidCitations(known);
  });
});

test.describe('docsbot real citations', () => {
  const bot = new DocsBot();
  test.beforeAll(async () => {
    await bot.init();
  });

  test('bot answers cite chunks that were actually retrieved', async () => {
    const { answer, retrievedChunks } = await bot.ask('What hook runs before every test?');
    expect(answer).toHaveValidCitations(retrievedChunks);
  });
});
