import { KnowledgeChunk, KnowledgeRepositorySnapshot } from "../knowledge.types";

export interface KnowledgeRepository {
  save(chunks: KnowledgeChunk[], aggregatedContent: string): void;
  getChunks(): KnowledgeChunk[];
  getAggregatedContent(): string;
  snapshot(): KnowledgeRepositorySnapshot;
}
