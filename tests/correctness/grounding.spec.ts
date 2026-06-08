import { test, expect } from '@playwright/test';
import { DocsBot } from '../../src/docsbot/index.js';
import '../../src/matchers/index.js';

const bot = new DocsBot();

test.beforeAll(async () => {
  await bot.init();
});

test('a real bot answer is grounded in the chunks it retrieved', async () => {
  const { answer, retrievedChunks } = await bot.ask(
    'How do I make a test in one file run in parallel?'
  );

  await expect(answer).toBeGroundedIn(retrievedChunks);
});

test('judge catches a hallucinated claim that contradicts the docs', async () => {
  // We hand-craft an answer that the docs do NOT support and feed it to the judge.
  // If the matcher passes here, our grounding check is rubber-stamping garbage.
  const { retrievedChunks } = await bot.ask(
    'How do I make a test in one file run in parallel?'
  );

  const fakeAnswer =
    "To run tests in parallel within a file, set the PLAYWRIGHT_PARALLEL=true env var and call test.runInParallel() inside each test.";

  await expect(fakeAnswer).not.toBeGroundedIn(retrievedChunks);
});
