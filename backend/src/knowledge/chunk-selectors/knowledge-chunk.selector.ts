import { KnowledgeChunk } from "../knowledge.types";

export interface KnowledgeChunkSelectorConfig {
  maxChunks: number;
  minScore?: number;
}

export interface KnowledgeChunkSelector {
  select(question: string, chunks: KnowledgeChunk[]): KnowledgeChunk[];
}
