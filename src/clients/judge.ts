import { getGeminiClient, DEFAULT_MODEL, Type, withRateLimitRetry } from './gemini.js';

const JUDGE_MODEL = process.env.JUDGE_MODEL ?? DEFAULT_MODEL;

export interface GroundingVerdict {
  grounded: boolean;
  unsupportedClaims: string[];
}

const GROUNDING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    grounded: { type: Type.BOOLEAN },
    unsupportedClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['grounded', 'unsupportedClaims'],
};

export async function judgeGrounding(
  answer: string,
  snippets: { chunkId: string; text: string }[]
): Promise<GroundingVerdict> {
  const client = getGeminiClient();

  const snippetsBlock = snippets
    .map((s) => `[${s.chunkId}]\n${s.text}`)
    .join('\n\n---\n\n');

  const prompt = `You are evaluating whether an answer is grounded in documentation snippets.

Snippets:
${snippetsBlock}

Answer to evaluate:
"${answer}"

A claim is GROUNDED if the snippets directly support it. Reasonable paraphrasing is fine.
A claim is UNSUPPORTED if it states something not present in the snippets, even if it sounds plausible.

Return JSON with:
  grounded: true only if EVERY factual claim in the answer is supported by the snippets
  unsupportedClaims: list each unsupported claim verbatim; empty array if grounded is true`;

  const response = await withRateLimitRetry(() =>
    client.models.generateContent({
      model: JUDGE_MODEL,
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: GROUNDING_SCHEMA,
      },
    })
  );

  const text = response.text;
  if (!text) throw new Error('Judge returned no content');

  return JSON.parse(text) as GroundingVerdict;
}
