export interface KnowledgeDocument {
  content: string;
  metadata?: KnowledgeDocumentMetadata;
}

export interface KnowledgeDocumentMetadata {
  source: string;
  loadedAt: Date;
  errorMessage?: string;
}

export interface KnowledgeImportFile {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}

export interface RawKnowledgeDocument {
  content: string;
  source: string;
}

export interface NormalizedKnowledge {
  content: string;
  source: string;
  importedAt: Date;
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
  section?: string;
}

export interface KnowledgeRepositorySnapshot {
  chunks: KnowledgeChunk[];
  aggregatedContent: string;
}
