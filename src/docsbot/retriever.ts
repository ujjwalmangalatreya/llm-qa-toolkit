import { embed } from '../clients/gemini.js';
import { cosineSimilarity } from '../utils/similarity.js';
import type { Chunk } from './loader.js';

export interface RetrievedChunk extends Chunk {
  score: number;
}

export class Retriever {
  private vectors: number[][] | null = null;

  constructor(private chunks: Chunk[]) {}

  async index() {
    if (this.vectors) return;
    this.vectors = await embed(this.chunks.map((c) => c.text), 'RETRIEVAL_DOCUMENT');
  }

  async search(query: string, k = 3): Promise<RetrievedChunk[]> {
    if (!this.vectors) await this.index();
    const [qv] = await embed([query], 'RETRIEVAL_QUERY');

    return this.chunks
      .map((c, i) => ({ ...c, score: cosineSimilarity(qv, this.vectors![i]) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}
