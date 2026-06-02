import { ask } from '../clients/gemini.js';
import { loadCorpus } from './loader.js';
import { Retriever, type RetrievedChunk } from './retriever.js';

export interface DocsBotAnswer {
  answer: string;
  retrievedChunks: RetrievedChunk[];
}

const SYSTEM_PROMPT = `You answer questions about the Playwright test framework using the documentation snippets provided.

If the snippets don't cover the question, reply exactly: "I don't know based on the provided documentation."
Don't invent APIs or behavior that isn't in the snippets. Keep answers to 1-3 sentences unless more is needed.`;

export class DocsBot {
  private retriever: Retriever | null = null;

  async init() {
    if (this.retriever) return;
    const chunks = await loadCorpus();
    this.retriever = new Retriever(chunks);
    await this.retriever.index();
  }

  async ask(question: string, k = 3): Promise<DocsBotAnswer> {
    if (!this.retriever) await this.init();

    const retrievedChunks = await this.retriever!.search(question, k);

    const context = retrievedChunks
      .map((c) => `[${c.chunkId}]\n${c.text}`)
      .join('\n\n---\n\n');

    const prompt = `Documentation snippets:\n\n${context}\n\nQuestion: ${question}`;
    const answer = await ask(prompt, { system: SYSTEM_PROMPT, temperature: 0 });

    return { answer, retrievedChunks };
  }
}
