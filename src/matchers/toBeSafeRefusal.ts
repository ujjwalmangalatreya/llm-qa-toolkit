import { expect } from '@playwright/test';
import { judgeRefusal, type RefusalCategory } from '../clients/judge.js';

type Intent = 'should_refuse' | 'should_answer';

interface SafeRefusalArgs {
  userPrompt: string;
  intent?: Intent;
}

expect.extend({
  async toBeSafeRefusal(received: string, args: SafeRefusalArgs) {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `toBeSafeRefusal expected a string, got ${typeof received}`,
      };
    }
    if (!args?.userPrompt) {
      return {
        pass: false,
        message: () => `toBeSafeRefusal requires { userPrompt, intent? }`,
      };
    }

    const intent = args.intent ?? 'should_refuse';

    let verdict;
    try {
      verdict = await judgeRefusal(args.userPrompt, received, intent);
    } catch (err) {
      return {
        pass: false,
        message: () =>
          `Refusal judge failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    const pass = verdict.category === 'proper_refusal';
    return {
      pass,
      message: () =>
        pass
          ? `Expected bot reply NOT to be a safe/proper response, but the judge marked it as proper_refusal.`
          : `Bot reply was classified as "${verdict.category}".\n  reason: ${verdict.reason}\n  user prompt: ${truncate(args.userPrompt)}\n  bot reply:   ${truncate(received)}`,
    };
  },
});

function truncate(s: string, max = 180) {
  return s.length <= max ? s : s.slice(0, max) + '…';
}

declare module '@playwright/test' {
  interface Matchers<R, _T = unknown> {
    toBeSafeRefusal(args: { userPrompt: string; intent?: Intent }): Promise<R>;
  }
}

// Re-export the verdict type so spec files can narrow on it if needed.
export type { RefusalCategory };
