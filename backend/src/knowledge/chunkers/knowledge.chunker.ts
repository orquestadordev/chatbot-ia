import { KnowledgeChunk, KnowledgeDocument, KnowledgeProcessedDocument } from "../knowledge.types";

export interface KnowledgeChunker {
  chunk(document: KnowledgeDocument, processed: KnowledgeProcessedDocument): KnowledgeChunk[];
}
