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
