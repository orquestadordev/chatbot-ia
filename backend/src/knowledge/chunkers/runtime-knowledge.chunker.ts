import { randomUUID } from "node:crypto";
import { KnowledgeChunk, NormalizedKnowledge } from "../knowledge.types";

const DEFAULT_MAX_CHUNK_SIZE = 900;
const HEADING_REGEX = /^#{1,6}\s+(?<title>.+)$/;
const LIST_LINE_REGEX = /^\s*([-*+]|\d+\.)\s+/;

export class RuntimeKnowledgeChunker {
  constructor(private readonly maxChunkSize: number = DEFAULT_MAX_CHUNK_SIZE) {}

  chunk(document: NormalizedKnowledge): KnowledgeChunk[] {
    if (!document.content.trim()) {
      return [];
    }

    const blocks = document.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    const chunks: KnowledgeChunk[] = [];

    let currentChunk = "";
    let order = 0;
    let currentSection: string | undefined;
    let pendingHeading: string | null = null;

    const flushChunk = (): void => {
      if (!currentChunk.trim()) {
        return;
      }
      chunks.push({
        id: `${document.source}-${randomUUID()}`,
        content: currentChunk.trim(),
        order,
        source: document.source,
        section: currentSection
      });
      order += 1;
      currentChunk = "";
    };

    for (const block of blocks) {
      const headingMatch = block.match(HEADING_REGEX);
      if (headingMatch?.groups?.title) {
        if (currentChunk) {
          flushChunk();
        }
        currentSection = headingMatch.groups.title.trim();
        pendingHeading = block;
        continue;
      }

      let blockContent = block;
      if (pendingHeading) {
        blockContent = `${pendingHeading}\n${blockContent}`;
        pendingHeading = null;
      }

      if (!currentChunk) {
        currentChunk = blockContent;
        if (currentChunk.length > this.maxChunkSize) {
          const pieces = this.splitBlock(blockContent);
          for (const piece of pieces) {
            currentChunk = piece;
            flushChunk();
          }
        }
        continue;
      }

      const candidate = `${currentChunk}\n\n${blockContent}`;
      if (candidate.length <= this.maxChunkSize) {
        currentChunk = candidate;
        continue;
      }

      flushChunk();

      if (blockContent.length > this.maxChunkSize) {
        const pieces = this.splitBlock(blockContent);
        for (const piece of pieces) {
          currentChunk = piece;
          flushChunk();
        }
        continue;
      }

      currentChunk = blockContent;
    }

    flushChunk();
    return chunks;
  }

  private splitBlock(block: string): string[] {
    if (LIST_LINE_REGEX.test(block)) {
      return block
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.slice(0, this.maxChunkSize));
    }

    const sentences = block.split(/(?<=[.!?])\s+/).filter(Boolean);
    const pieces: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if (sentence.length > this.maxChunkSize) {
        if (current) {
          pieces.push(current.trim());
          current = "";
        }
        for (let i = 0; i < sentence.length; i += this.maxChunkSize) {
          pieces.push(sentence.slice(i, i + this.maxChunkSize));
        }
        continue;
      }

      const candidate = current ? `${current} ${sentence}` : sentence;
      if (candidate.length <= this.maxChunkSize) {
        current = candidate;
        continue;
      }

      if (current) {
        pieces.push(current.trim());
      }
      current = sentence;
    }

    if (current) {
      pieces.push(current.trim());
    }

    return pieces.filter(Boolean);
  }
}

export const runtimeKnowledgeChunker = new RuntimeKnowledgeChunker();
