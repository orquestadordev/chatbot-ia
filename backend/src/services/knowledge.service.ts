import { KNOWLEDGE_FALLBACK_RESPONSE, KNOWLEDGE_SYSTEM_PROMPT_TEMPLATE } from "../constants/prompt.constants";
import { KnowledgeProcessedDocument } from "../knowledge/knowledge.types";
import { KnowledgeProcessor } from "../knowledge/processors/knowledge.processor";
import { simpleKnowledgeProcessor } from "../knowledge/processors/simple-knowledge.processor";
import { FileKnowledgeSource, fileKnowledgeSource } from "../knowledge/sources/file-knowledge.source";
import { KnowledgeSource } from "../knowledge/sources/knowledge.source";

export class KnowledgeService {
  private processedDocument: KnowledgeProcessedDocument = {
    fullText: "",
    normalizedText: ""
  };

  constructor(
    private readonly source: KnowledgeSource = fileKnowledgeSource,
    private readonly processor: KnowledgeProcessor = simpleKnowledgeProcessor
  ) {
    this.refreshContext();
  }

  refreshContext(): void {
    const document = this.source.load();
    this.processedDocument = this.processor.process(document);
  }

  getFullContext(): string {
    return this.processedDocument.fullText;
  }

  hasInformation(question: string): boolean {
    return this.processor.hasInformation(this.processedDocument, question);
  }

  buildSystemPrompt(): string {
    const knowledge = this.getFullContext();
    return KNOWLEDGE_SYSTEM_PROMPT_TEMPLATE.replace(
      "{{KNOWLEDGE_CONTENT}}",
      knowledge || "(sin información disponible)"
    );
  }

  buildUserPrompt(question: string): string {
    return `Pregunta del usuario: ${question}\nRecuerda aplicar las reglas anteriores.`;
  }

  getFallbackResponse(): string {
    return KNOWLEDGE_FALLBACK_RESPONSE;
  }
}

export const knowledgeService = new KnowledgeService(
  new FileKnowledgeSource(),
  simpleKnowledgeProcessor
);
