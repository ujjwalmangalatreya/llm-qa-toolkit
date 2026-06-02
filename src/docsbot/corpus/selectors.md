# Selectors and Locators

Playwright uses **locators** to find elements on a page. A locator describes how to find an element and is the recommended way to interact with the DOM.

## Recommended locators

The preferred locators are user-facing and resilient to UI changes:

- `page.getByRole(role, options)` — locate by ARIA role, e.g. `getByRole('button', { name: 'Submit' })`
- `page.getByText(text)` — locate by visible text content
- `page.getByLabel(label)` — locate a form control by its associated label
- `page.getByPlaceholder(text)` — locate an input by its placeholder text
- `page.getByTestId(testId)` — locate by `data-testid` attribute

## CSS and XPath selectors

For cases where user-facing locators don't fit, `page.locator(selector)` accepts CSS or XPath, e.g. `page.locator('css=button.primary')` or `page.locator('xpath=//button[1]')`. These are more brittle and should be used sparingly.

## Chaining and filtering

Locators can be chained to narrow the search: `page.getByRole('listitem').filter({ hasText: 'Product 1' }).getByRole('button', { name: 'Add to cart' })`. Filtering accepts `hasText`, `hasNotText`, `has`, and `hasNot` to compose precise selections.
