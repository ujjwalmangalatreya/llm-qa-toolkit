import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: {
    timeout: 30_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'basic',
      testDir: './tests/basic',
    },
    {
      name: 'docsbot',
      testDir: './tests/docsbot',
      testMatch: '**/*.spec.ts',
    },
    {
      name: 'correctness',
      testDir: './tests/correctness',
      testMatch: '**/*.spec.ts',
    },
    {
      name: 'safety',
      testDir: './tests/safety',
      testMatch: '**/*.spec.ts',
    },
  ],
});
