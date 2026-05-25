import { test, expect } from '@playwright/test';
import { getGeminiClient, DEFAULT_MODEL } from '../../src/clients/gemini.js';

test.describe('streaming', () => {
  test('streams text chunks and accumulates into a coherent answer', async () => {
    const client = getGeminiClient();

    const stream = await client.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents:
        'Count from one to five in English, one number per line, no extra text.',
      config: {
        temperature: 0,
        maxOutputTokens: 256,
      },
    });

    const chunks: string[] = [];
    for await (const chunk of stream) {
      if (chunk.text) chunks.push(chunk.text);
    }

    expect(chunks.length, 'expected at least one streamed chunk').toBeGreaterThan(0);

    const full = chunks.join('');
    for (const word of ['one', 'two', 'three', 'four', 'five']) {
      expect(full.toLowerCase()).toContain(word);
    }
  });
});
