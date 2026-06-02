# Fixtures

Fixtures are objects set up before each test and torn down after. Playwright ships with built-in fixtures like `page`, `browser`, `context`, and `request`, and you can define your own.

## Built-in fixtures

- `page` — a new isolated browser page for each test
- `context` — the browser context that owns the page; isolates cookies, storage, and permissions
- `browser` — the shared browser instance for the worker
- `request` — an APIRequestContext for making HTTP requests outside the browser

## Hooks

- `test.beforeEach(async ({ page }) => { ... })` — runs before every test in the file
- `test.afterEach(async ({ page }) => { ... })` — runs after every test, regardless of pass or fail
- `test.beforeAll` / `test.afterAll` — run once per worker, around the whole file

## Custom fixtures

Define new fixtures by extending the base `test`:

```ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await use(page);
  },
});
```

The `use` callback hands the value to the test; code after `use` runs as teardown.

## Fixture scope

Fixtures default to `test` scope (recreated for each test). Set `scope: 'worker'` to reuse the same instance across all tests in a worker — useful for expensive setup like seeding a database.
