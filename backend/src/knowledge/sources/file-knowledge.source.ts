import { readFileSync } from "fs";
import { KNOWLEDGE_FILE_ENCODING, KNOWLEDGE_FILE_PATH } from "../../constants/knowledge.constants";
import { KnowledgeDocument } from "../knowledge.types";
import { KnowledgeSource } from "./knowledge.source";

export class FileKnowledgeSource implements KnowledgeSource {
  constructor(
    private readonly filePath: string = KNOWLEDGE_FILE_PATH,
    private readonly encoding: BufferEncoding = KNOWLEDGE_FILE_ENCODING
  ) {}

  load(): KnowledgeDocument {
    try {
      const content = readFileSync(this.filePath, { encoding: this.encoding }).trim();
      return {
        content,
        metadata: {
          source: this.filePath,
          loadedAt: new Date()
        }
      };
    } catch (error) {
      console.warn(`No se pudo leer la fuente de conocimiento en ${this.filePath}`, error);
      return {
        content: "",
        metadata: {
          source: this.filePath,
          loadedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
}

export const fileKnowledgeSource = new FileKnowledgeSource();
