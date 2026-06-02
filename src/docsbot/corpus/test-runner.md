# Test Runner

The Playwright test runner executes tests in parallel across multiple worker processes by default. Each worker is an independent Node.js process with its own browser context, providing strong isolation between tests.

## Parallelism and workers

By default Playwright runs one worker per CPU core. The number of workers can be controlled with the `workers` option in `playwright.config.ts` or the `--workers` CLI flag. Tests within a single file run sequentially in the same worker; tests across different files run in parallel.

To run tests in a single file in parallel, add `test.describe.configure({ mode: 'parallel' })` at the top of the file.

## Retries

Flaky tests can be retried automatically with the `retries` option in the config or the `--retries` CLI flag. A test marked as flaky (passed on retry) is reported separately so it can be investigated without failing the build.

## Sharding

For very large suites, tests can be sharded across multiple machines using `--shard=N/M`, where N is the current shard and M is the total. Each shard runs an independent subset of the tests and the results can be merged afterward.

## Test isolation

Each test gets a fresh browser context — meaning fresh cookies, localStorage, and permissions. This isolation is the default and is what makes parallel execution safe. To share authentication state, use `storageState` instead of disabling isolation.

## Reporters

Built-in reporters include `list`, `line`, `dot`, `json`, `junit`, and `html`. The `html` reporter produces an interactive report at `playwright-report/` that can be opened with `npx playwright show-report`.
