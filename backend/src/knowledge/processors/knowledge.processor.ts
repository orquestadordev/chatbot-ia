import { KnowledgeDocument, KnowledgeProcessedDocument } from "../knowledge.types";

export interface KnowledgeProcessor {
  process(document: KnowledgeDocument): KnowledgeProcessedDocument;
  hasInformation(processedDocument: KnowledgeProcessedDocument, query: string): boolean;
}
