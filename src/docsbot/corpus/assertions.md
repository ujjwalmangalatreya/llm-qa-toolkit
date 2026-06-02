# Assertions

Playwright uses the `expect` function for assertions. Web-first assertions like `expect(locator).toBeVisible()` automatically wait until the condition is met or the timeout expires, removing the need for manual sleeps.

## Common locator assertions

- `expect(locator).toBeVisible()` — element is rendered and visible
- `expect(locator).toBeHidden()` — element is not visible
- `expect(locator).toHaveText(text)` — element has exactly the given text
- `expect(locator).toContainText(text)` — element contains the substring
- `expect(locator).toHaveValue(value)` — input has the given value
- `expect(locator).toBeEnabled()` / `toBeDisabled()` — element is enabled or disabled
- `expect(locator).toHaveCount(n)` — locator resolves to exactly n elements

## Page-level assertions

- `expect(page).toHaveURL(url)` — page is on the given URL
- `expect(page).toHaveTitle(title)` — page title matches

## Auto-waiting and retry

Web-first assertions retry the check until either the expectation passes or the test timeout is reached. The default expect timeout is 5 seconds and can be configured globally via `expect.timeout` or per-assertion with `expect(locator).toBeVisible({ timeout: 10000 })`. This eliminates flakiness from race conditions.

## Soft assertions

Use `expect.soft(...)` to record a failure but continue executing the test. This is helpful when you want to gather multiple assertion results before failing the test.
