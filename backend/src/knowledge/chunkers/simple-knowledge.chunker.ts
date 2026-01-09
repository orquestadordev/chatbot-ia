import { KnowledgeChunk, KnowledgeDocument, KnowledgeProcessedDocument } from "../knowledge.types";
import { KnowledgeChunker } from "./knowledge.chunker";

const DEFAULT_CHUNK_SIZE = 400;
const SEPARATOR = "\n---\n";

export class SimpleKnowledgeChunker implements KnowledgeChunker {
  constructor(private readonly maxChunkSize: number = DEFAULT_CHUNK_SIZE) {}

  chunk(document: KnowledgeDocument, processed: KnowledgeProcessedDocument): KnowledgeChunk[] {
    const text = processed.fullText || "";
    if (!text.trim()) {
      return [];
    }

    const chunks: KnowledgeChunk[] = [];
    const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

    let current = "";
    let chunkIndex = 0;

    const flushChunk = () => {
      if (!current.trim()) {
        return;
      }
      chunks.push({
        id: `${document.metadata?.source ?? "knowledge"}-chunk-${chunkIndex + 1}`,
        content: current.trim(),
        order: chunkIndex,
        source: document.metadata?.source ?? "unknown"
      });
      chunkIndex += 1;
      current = "";
    };

    for (const paragraph of paragraphs) {
      const candidate = current ? `${current}${SEPARATOR}${paragraph}` : paragraph;

      if (candidate.length <= this.maxChunkSize) {
        current = candidate;
        continue;
      }

      flushChunk();

      if (paragraph.length > this.maxChunkSize) {
        const pieces = this.breakIntoSubchunks(paragraph);
        for (const piece of pieces) {
          current = piece;
          flushChunk();
        }
      } else {
        current = paragraph;
      }
    }

    flushChunk();
    return chunks;
  }

  private breakIntoSubchunks(text: string): string[] {
    const pieces: string[] = [];
    const words = text.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      if (word.length > this.maxChunkSize) {
        if (current) {
          pieces.push(current);
          current = "";
        }
        for (let i = 0; i < word.length; i += this.maxChunkSize) {
          pieces.push(word.slice(i, i + this.maxChunkSize));
        }
        continue;
      }

      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= this.maxChunkSize) {
        current = candidate;
      } else {
        if (current) {
          pieces.push(current);
        }
        current = word;
      }
    }

    if (current) {
      pieces.push(current);
    }

    return pieces;
  }
}

export const simpleKnowledgeChunker = new SimpleKnowledgeChunker();
