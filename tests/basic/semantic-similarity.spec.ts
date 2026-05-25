import { test, expect } from '@playwright/test';
import { ask } from '../../src/clients/gemini.js';
import '../../src/matchers/index.js';

test.describe('semantic similarity matcher', () => {
  test('answer is semantically similar to expected reference', async () => {
    const answer = await ask(
      'In one sentence, describe what Playwright is used for.'
    );

    await expect(answer).toBeSemanticallySimilar(
      'Playwright is an end-to-end testing framework for web applications across multiple browsers.'
    );
  });

  test('paraphrases match even when wording differs', async () => {
    const a = 'The Eiffel Tower is located in Paris, France.';
    const b = 'Paris is home to the famous Eiffel Tower.';

    await expect(a).toBeSemanticallySimilar(b, { threshold: 0.7 });
  });

  test('unrelated strings do NOT match', async () => {
    const a = 'I love eating sushi on weekends.';
    const b = 'TypeScript is a typed superset of JavaScript.';

    await expect(a).not.toBeSemanticallySimilar(b, { threshold: 0.7 });
  });
});
