import { KnowledgeChunk, KnowledgeRepositorySnapshot } from "../knowledge.types";
import { KnowledgeRepository } from "./knowledge.repository";

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private chunks: KnowledgeChunk[] = [];
  private aggregatedContent = "";

  save(chunks: KnowledgeChunk[], aggregatedContent: string): void {
    this.chunks = chunks;
    this.aggregatedContent = aggregatedContent;
  }

  getChunks(): KnowledgeChunk[] {
    return this.chunks;
  }

  getAggregatedContent(): string {
    return this.aggregatedContent;
  }

  snapshot(): KnowledgeRepositorySnapshot {
    return {
      chunks: this.chunks,
      aggregatedContent: this.aggregatedContent,
    };
  }
}
