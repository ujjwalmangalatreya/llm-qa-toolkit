# llm-qa-toolkit

> A Playwright-based test harness for evaluating LLM applications — correctness, grounding, safety, bias, and performance. Built around Google Gemini, with a provider-neutral architecture.

[![PR smoke tests](https://github.com/OWNER/llm-qa-toolkit/actions/workflows/pr-smoke.yml/badge.svg)](https://github.com/OWNER/llm-qa-toolkit/actions/workflows/pr-smoke.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.49-45ba4b)](https://playwright.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5-4285F4)](https://ai.google.dev/)

LLM apps don't fail like regular apps. They drift, hallucinate, get jailbroken, leak data, and regress silently after a prompt tweak. Traditional unit tests can't catch any of that. This toolkit is a working answer to **"how do you actually QA an LLM-powered product?"**

---

## What this is

A reusable test framework, not a one-off project. It treats LLM quality as something you measure continuously, with the same rigor you'd apply to a web app's E2E suite.

The framework provides:

- **A custom Playwright matcher (`toBeSemanticallySimilar`)** that asserts on *meaning*, not exact strings, by embedding both sides and comparing cosine similarity.
- **A first-class Gemini client** — one tiny, ergonomic helper handles both text generation and embeddings, so a test is three lines, not thirty.
- **Test categories** that map to how LLM apps actually fail: correctness, grounding, citations, safety, bias, performance. (More land in later phases — this scaffold covers basics.)
- **A reference system under test** — `docsbot-demo`, a deliberately-flawed RAG chatbot that lives in a sibling repo so this toolkit has something real to point at.
- **CI/CD integration** — PR smoke tests, nightly full runs, an artifact-published HTML report on every run.

---

## Why this exists

If you've shipped a Gemini-powered feature, you've probably had this conversation:

> **PM:** "Why did the bot suddenly start refusing valid questions yesterday?"
> **Eng:** "We tweaked the system prompt. We didn't think it would break anything."
> **PM:** "How would we have caught that before shipping?"

You wouldn't have. Not with unit tests. Not with manual QA. The only way to catch that class of regression is **a continuous evaluation harness that runs real prompts against the live model and asserts on the answers**. That's what this is.

---

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/OWNER/llm-qa-toolkit.git
cd llm-qa-toolkit
npm install

# 2. Add your Gemini API key (free at https://aistudio.google.com/apikey)
cp .env.example .env.local
# Edit .env.local — add GEMINI_API_KEY

# 3. Run the smoke suite
npm run test:smoke

# 4. Open the HTML report
npm run report
```

You should see ~10 tests pass in under a minute. Each one calls the live Gemini API. **The Gemini free tier covers all dev + CI usage for this toolkit at typical volumes — no credit card required.**

---

## What the tests look like

### Plain assertion against a model response

```ts
import { test, expect } from '@playwright/test';
import { ask } from '../../src/clients/gemini.js';

test('answers a factual question correctly', async () => {
  const answer = await ask(
    'What is the capital of France? Reply with just the city name.'
  );
  expect(answer.toLowerCase()).toContain('paris');
});
```

### Semantic-similarity matcher (the headline feature)

```ts
import '../../src/matchers/index.js';

test('answer matches the reference even when worded differently', async () => {
  const answer = await ask('In one sentence, describe Playwright.');

  await expect(answer).toBeSemanticallySimilar(
    'Playwright is an end-to-end testing framework for web apps across multiple browsers.'
  );
  // Internally: embeds both strings with gemini-embedding-001 (task type
  // SEMANTIC_SIMILARITY), computes cosine similarity, passes if
  // >= SIMILARITY_THRESHOLD (default 0.75).
});
```

### Function-call (tool use) validation

```ts
test('Gemini requests the right function with the right arguments', async () => {
  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents: 'Weather in Tokyo in celsius?',
    config: {
      tools: [{ functionDeclarations: [{ name: 'get_weather', /* …schema… */ }] }],
    },
  });

  expect(response.functionCalls![0].name).toBe('get_weather');
  // …assert on the function call's args
});
```

See [tests/basic/](tests/basic/) for all five working examples.

---

## Repo layout

```
llm-qa-toolkit/
├── src/
│   ├── clients/
│   │   └── gemini.ts           # Singleton Gemini client + ask() + embed() helpers
│   ├── matchers/
│   │   ├── toBeSemanticallySimilar.ts
│   │   └── index.ts            # Registers all matchers
│   └── utils/
│       └── similarity.ts       # Cosine similarity
├── tests/
│   └── basic/                  # Phase 1: 5 working tests against Gemini
│       ├── completion.spec.ts
│       ├── deterministic.spec.ts
│       ├── semantic-similarity.spec.ts
│       ├── streaming.spec.ts
│       └── tool-use.spec.ts
├── .github/workflows/
│   └── pr-smoke.yml            # CI: runs the smoke suite on every PR
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---


