import { test, expect } from '@playwright/test';
import { ask } from '../../src/clients/gemini.js';

test.describe('determinism with temperature=0', () => {
  test('same prompt produces stable answers across two calls', async () => {
    const prompt =
      'What is 17 multiplied by 23? Reply with just the number, no other text.';

    const [first, second] = await Promise.all([
      ask(prompt, { temperature: 0 }),
      ask(prompt, { temperature: 0 }),
    ]);

    expect(first.trim()).toBe('391');
    expect(second.trim()).toBe('391');
  });

  test('system prompt shapes the persona consistently', async () => {
    const answer = await ask('Hello!', {
      system:
        'You are a pirate. Always start your reply with "Arrr!" and use pirate slang.',
    });

    expect(answer.toLowerCase()).toContain('arrr');
  });
});
