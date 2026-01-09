import { KnowledgeDocument } from "../knowledge.types";

export interface KnowledgeSource {
  load(): KnowledgeDocument;
}
