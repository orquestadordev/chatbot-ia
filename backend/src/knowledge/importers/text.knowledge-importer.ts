import path from "node:path";
import { KnowledgeImportFile, RawKnowledgeDocument } from "../knowledge.types";
import { KnowledgeImporter } from "./knowledge-importer";

const TEXT_EXTENSIONS = new Set([".txt"]);
const TEXT_MIME_TYPES = new Set(["text/plain", "application/octet-stream"]);

export class TextKnowledgeImporter implements KnowledgeImporter {
  supports(file: KnowledgeImportFile): boolean {
    const extension = path.extname(file.originalName).toLowerCase();
    return TEXT_EXTENSIONS.has(extension) || TEXT_MIME_TYPES.has(file.mimeType);
  }

  async extract(file: KnowledgeImportFile): Promise<RawKnowledgeDocument> {
    return {
      content: this.stripBom(file.buffer.toString("utf-8")),
      source: file.originalName
    };
  }

  private stripBom(value: string): string {
    if (value.charCodeAt(0) === 0xfeff) {
      return value.slice(1);
    }
    return value;
  }
}

export const textKnowledgeImporter = new TextKnowledgeImporter();
