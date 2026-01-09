import { KNOWLEDGE_CHUNK_SELECTION_CONFIG } from "../../constants/knowledge.constants";
import { KnowledgeChunk } from "../knowledge.types";
import { KnowledgeChunkSelector, KnowledgeChunkSelectorConfig } from "./knowledge-chunk.selector";

const WORD_REGEX = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_]+/g;
const MIN_KEYWORD_LENGTH = 3;

interface ScoredChunk {
  chunk: KnowledgeChunk;
  score: number;
}

export class KeywordKnowledgeChunkSelector implements KnowledgeChunkSelector {
  private readonly maxChunks: number;
  private readonly minScore?: number;

  constructor(config: KnowledgeChunkSelectorConfig = KNOWLEDGE_CHUNK_SELECTION_CONFIG) {
    this.maxChunks = Math.max(1, Math.floor(config.maxChunks));
    this.minScore = config.minScore;
  }

  select(question: string, chunks: KnowledgeChunk[]): KnowledgeChunk[] {
    const safeChunks = this.removeEmptyChunks(chunks);
    if (!safeChunks.length) {
      return [];
    }

    const keywords = this.extractKeywords(question);
    if (!keywords.length) {
      return this.safeFallback(safeChunks);
    }

    const scored = safeChunks
      .map((chunk) => ({
        chunk,
        score: this.scoreChunk(chunk, keywords)
      }))
      .filter((entry) => entry.score > 0);

    const filtered = this.applyMinScore(scored);
    const candidates = (filtered.length ? filtered : scored).sort(this.sortByScoreThenOrder);
    const selected = candidates.slice(0, this.maxChunks).map((entry) => entry.chunk);

    if (!selected.length) {
      return this.safeFallback(safeChunks);
    }

    return selected;
  }

  private extractKeywords(text: string): string[] {
    if (!text?.trim()) {
      return [];
    }

    const matches = text.toLowerCase().match(WORD_REGEX);
    if (!matches) {
      return [];
    }

    const frequencies = matches.reduce<Record<string, number>>((acc, word) => {
      acc[word] = (acc[word] ?? 0) + 1;
      return acc;
    }, {});

    return Object.keys(frequencies).filter((word) => word.length >= MIN_KEYWORD_LENGTH);
  }

  private scoreChunk(chunk: KnowledgeChunk, keywords: string[]): number {
    const normalizedContent = chunk.content.toLowerCase();
    return keywords.reduce((score, keyword) => {
      const occurrences = normalizedContent.split(keyword).length - 1;
      return score + occurrences;
    }, 0);
  }

  private applyMinScore(entries: ScoredChunk[]): ScoredChunk[] {
    if (this.minScore === undefined) {
      return entries;
    }
    const minScore = this.minScore;
    return entries.filter((entry) => entry.score >= (minScore ?? 0));
  }

  private sortByScoreThenOrder(a: ScoredChunk, b: ScoredChunk): number {
    if (b.score === a.score) {
      return a.chunk.order - b.chunk.order;
    }
    return b.score - a.score;
  }

  private safeFallback(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
    return chunks.slice(0, this.maxChunks);
  }

  private removeEmptyChunks(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
    return chunks.filter((chunk) => Boolean(chunk.content?.trim()));
  }
}

export const keywordKnowledgeChunkSelector = new KeywordKnowledgeChunkSelector();
