import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface Chunk {
  docId: string;
  chunkId: string;
  text: string;
}

const corpusDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'corpus');

export async function loadCorpus(dir = corpusDir): Promise<Chunk[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  const chunks: Chunk[] = [];

  for (const file of files) {
    const docId = path.basename(file, '.md');
    const raw = await readFile(path.join(dir, file), 'utf-8');

    const paragraphs = raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    paragraphs.forEach((text, i) => {
      chunks.push({ docId, chunkId: `${docId}#${i}`, text });
    });
  }

  return chunks;
}
