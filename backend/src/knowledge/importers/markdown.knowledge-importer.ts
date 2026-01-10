import path from "node:path";
import { KnowledgeImportFile, RawKnowledgeDocument } from "../knowledge.types";
import { KnowledgeImporter } from "./knowledge-importer";

const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown", ".mdx"]);
const MARKDOWN_MIME_TYPES = new Set(["text/markdown", "text/x-markdown"]);

export class MarkdownKnowledgeImporter implements KnowledgeImporter {
  supports(file: KnowledgeImportFile): boolean {
    const extension = path.extname(file.originalName).toLowerCase();
    return MARKDOWN_EXTENSIONS.has(extension) || MARKDOWN_MIME_TYPES.has(file.mimeType);
  }

  async extract(file: KnowledgeImportFile): Promise<RawKnowledgeDocument> {
    return {
      content: this.stripFrontMatter(this.stripBom(file.buffer.toString("utf-8"))),
      source: file.originalName
    };
  }

  private stripBom(value: string): string {
    if (!value.length) {
      return value;
    }
    return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
  }

  private stripFrontMatter(value: string): string {
    if (!value.startsWith("---")) {
      return value;
    }

    const closingIndex = value.indexOf("\n---", 3);
    if (closingIndex === -1) {
      return value;
    }

    return value.slice(closingIndex + 4).trimStart();
  }
}

export const markdownKnowledgeImporter = new MarkdownKnowledgeImporter();
