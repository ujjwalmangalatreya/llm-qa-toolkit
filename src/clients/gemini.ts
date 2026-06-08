import { GoogleGenAI, Type } from '@google/genai';

let _client: GoogleGenAI | null = null;

/**
 * Returns a singleton Google Gen AI client. Reads GEMINI_API_KEY from the
 * environment — playwright.config.ts loads .env.local before any test runs.
 */
export function getGeminiClient(): GoogleGenAI {
  if (_client) return _client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Copy .env.example to .env.local and add your key.'
    );
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}

export const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
export const DEFAULT_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';

export { Type };

export interface AskOptions {
  model?: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Convenience wrapper for a single-turn text completion. Returns the raw text
 * of the response — most basic tests only need that.
 */
export async function ask(prompt: string, options: AskOptions = {}): Promise<string> {
  const client = getGeminiClient();

  const response = await withRateLimitRetry(() =>
    client.models.generateContent({
      model: options.model ?? DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: options.system,
        temperature: options.temperature ?? 0,
        maxOutputTokens: options.maxTokens ?? 1024,
      },
    })
  );

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned no text content');
  }
  return text;
}

/**
 * Returns the raw response so tests can assert on functionCalls, usage, etc.
 */
export async function askRaw(prompt: string, options: AskOptions = {}) {
  const client = getGeminiClient();

  return withRateLimitRetry(() =>
    client.models.generateContent({
      model: options.model ?? DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: options.system,
        temperature: options.temperature ?? 0,
        maxOutputTokens: options.maxTokens ?? 1024,
      },
    })
  );
}

export type EmbeddingTaskType =
  | 'SEMANTIC_SIMILARITY'
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'CLASSIFICATION'
  | 'CLUSTERING';

/**
 * Embeds one or more texts. For comparing two strings (e.g. in
 * toBeSemanticallySimilar) use 'SEMANTIC_SIMILARITY'. For RAG, use
 * 'RETRIEVAL_QUERY' for the user question and 'RETRIEVAL_DOCUMENT' for corpus
 * chunks — Gemini uses different projections per task type.
 */
export async function embed(
  input: string | string[],
  taskType: EmbeddingTaskType = 'SEMANTIC_SIMILARITY'
): Promise<number[][]> {
  const client = getGeminiClient();
  const texts = Array.isArray(input) ? input : [input];

  const response = await withRateLimitRetry(() =>
    client.models.embedContent({
      model: DEFAULT_EMBEDDING_MODEL,
      contents: texts,
      config: { taskType },
    })
  );

  if (!response.embeddings) {
    throw new Error('Gemini returned no embedding data');
  }

  return response.embeddings.map((e) => {
    if (!e.values) throw new Error('Gemini returned an embedding without vector data');
    return e.values;
  });
}

// Free tier quotas (100 RPM embed, ~15 RPM flash) get exhausted by bursty
// test suites. Honor the retryDelay the API tells us, fall back to expo backoff.
export async function withRateLimitRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
      if (!is429 || attempt >= maxAttempts) throw err;

      const m = msg.match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/);
      const waitMs = m ? Math.ceil(parseFloat(m[1]) * 1000) + 500 : 2 ** attempt * 1000;
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
}

/**
 * Embeds a single string and returns the bare vector. Handy for tests that
 * compare two strings.
 */
export async function embedOne(
  text: string,
  taskType: EmbeddingTaskType = 'SEMANTIC_SIMILARITY'
): Promise<number[]> {
  const [vector] = await embed(text, taskType);
  return vector;
}
