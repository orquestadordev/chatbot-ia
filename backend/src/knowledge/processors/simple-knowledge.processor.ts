import { KnowledgeDocument, KnowledgeProcessedDocument } from "../knowledge.types";
import { KnowledgeProcessor } from "./knowledge.processor";

const MIN_TOKEN_LENGTH = 4;
const TOKEN_REGEX = /[^a-záéíóúñü0-9]+/i;

export class SimpleKnowledgeProcessor implements KnowledgeProcessor {
  process(document: KnowledgeDocument): KnowledgeProcessedDocument {
    const fullText = (document.content ?? "").trim();
    return {
      fullText,
      normalizedText: fullText.toLowerCase()
    };
  }

  hasInformation(processedDocument: KnowledgeProcessedDocument, query: string): boolean {
    if (!processedDocument.fullText) {
      return false;
    }

    const tokens = query
      .toLowerCase()
      .split(TOKEN_REGEX)
      .filter((token) => token.length >= MIN_TOKEN_LENGTH);

    if (!tokens.length) {
      return false;
    }

    return tokens.some((token) => processedDocument.normalizedText.includes(token));
  }
}

export const simpleKnowledgeProcessor = new SimpleKnowledgeProcessor();
