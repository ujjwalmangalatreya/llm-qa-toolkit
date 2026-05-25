import { test, expect } from '@playwright/test';
import { ask } from '../../src/clients/gemini.js';

test.describe('basic completion @smoke', () => {
  test('responds with a non-empty string', async () => {
    const answer = await ask('Say hello in one word.');

    expect(answer).toBeTruthy();
    expect(answer.length).toBeGreaterThan(0);
  });

  test('answers a factual question correctly', async () => {
    const answer = await ask(
      'What is the capital of France? Reply with just the city name, nothing else.'
    );

    expect(answer.toLowerCase()).toContain('paris');
  });

  test('follows formatting instructions', async () => {
    const answer = await ask(
      'List the first three prime numbers as a comma-separated list. No other text.'
    );

    expect(answer.trim()).toMatch(/^2\s*,\s*3\s*,\s*5/);
  });
});
