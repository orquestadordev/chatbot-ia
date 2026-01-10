import { KnowledgeImportFile, RawKnowledgeDocument } from "../knowledge.types";

export interface KnowledgeImporter {
  supports(file: KnowledgeImportFile): boolean;
  extract(file: KnowledgeImportFile): Promise<RawKnowledgeDocument>;
}
