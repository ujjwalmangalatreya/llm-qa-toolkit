import { test, expect } from '@playwright/test';
import {
  getGeminiClient,
  DEFAULT_MODEL,
  Type,
} from '../../src/clients/gemini.js';

test.describe('tool use', () => {
  test('Gemini requests a function call with correctly-typed arguments', async () => {
    const client = getGeminiClient();

    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: 'What is the weather in Tokyo in celsius?',
      config: {
        tools: [
          {
            functionDeclarations: [
              {
                name: 'get_weather',
                description: 'Get the current weather for a city.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    city: {
                      type: Type.STRING,
                      description: 'City name, e.g. "Paris"',
                    },
                    unit: {
                      type: Type.STRING,
                      enum: ['celsius', 'fahrenheit'],
                    },
                  },
                  required: ['city'],
                },
              },
            ],
          },
        ],
      },
    });

    expect(response.functionCalls, 'expected at least one function call').toBeDefined();
    expect(response.functionCalls!.length).toBeGreaterThan(0);

    const call = response.functionCalls![0];
    expect(call.name).toBe('get_weather');

    const args = call.args as { city?: string; unit?: string };
    expect(args.city?.toLowerCase()).toContain('tokyo');
    expect(args.unit).toBe('celsius');
  });
});
