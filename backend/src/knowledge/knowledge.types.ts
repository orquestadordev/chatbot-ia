export interface KnowledgeDocument {
  content: string;
  metadata?: KnowledgeDocumentMetadata;
}

export interface KnowledgeDocumentMetadata {
  source: string;
  loadedAt: Date;
  errorMessage?: string;
}

export interface KnowledgeProcessedDocument {
  fullText: string;
  normalizedText: string;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  order: number;
  source: string;
}

export interface KnowledgeRepositorySnapshot {
  chunks: KnowledgeChunk[];
  aggregatedContent: string;
}
