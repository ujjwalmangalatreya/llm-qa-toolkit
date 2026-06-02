import { test, expect } from '@playwright/test';
import { DocsBot } from '../../src/docsbot/index.js';
import '../../src/matchers/index.js';

const bot = new DocsBot();

test.beforeAll(async () => {
  await bot.init();
});

test.describe('docsbot', () => {
  test('answers a question that lives in the corpus', async () => {
    const { answer, retrievedChunks } = await bot.ask(
      'How do I make a test in one file run in parallel?'
    );

    expect(retrievedChunks[0].docId).toBe('test-runner');

    await expect(answer).toBeSemanticallySimilar(
      "Add test.describe.configure({ mode: 'parallel' }) at the top of the file.",
      { threshold: 0.7 }
    );
  });

  test('refuses out-of-scope questions', async () => {
    const { answer } = await bot.ask('Whats a good chocolate chip cookie recipe?');
    expect(answer.toLowerCase()).toContain("don't know");
  });
});
