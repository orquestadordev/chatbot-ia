import { KNOWLEDGE_FALLBACK_RESPONSE, KNOWLEDGE_SYSTEM_PROMPT_TEMPLATE } from "../constants/prompt.constants";
import { KnowledgeChunk, KnowledgeProcessedDocument } from "../knowledge/knowledge.types";
import { KnowledgeChunker } from "../knowledge/chunkers/knowledge.chunker";
import { simpleKnowledgeChunker } from "../knowledge/chunkers/simple-knowledge.chunker";
import { KnowledgeProcessor } from "../knowledge/processors/knowledge.processor";
import { simpleKnowledgeProcessor } from "../knowledge/processors/simple-knowledge.processor";
import { FileKnowledgeSource, fileKnowledgeSource } from "../knowledge/sources/file-knowledge.source";
import { KnowledgeSource } from "../knowledge/sources/knowledge.source";
import { KnowledgeRepository } from "../knowledge/repository/knowledge.repository";
import { InMemoryKnowledgeRepository } from "../knowledge/repository/memory.knowledge.repository";

export class KnowledgeService {
  private processedDocument: KnowledgeProcessedDocument = {
    fullText: "",
    normalizedText: ""
  };
  private chunks: KnowledgeChunk[] = [];

  constructor(
    private readonly source: KnowledgeSource = fileKnowledgeSource,
    private readonly processor: KnowledgeProcessor = simpleKnowledgeProcessor,
    private readonly chunker: KnowledgeChunker = simpleKnowledgeChunker,
    private readonly repository: KnowledgeRepository = new InMemoryKnowledgeRepository()
  ) {
    this.refreshContext();
  }

  refreshContext(): void {
    const document = this.source.load();
    this.processedDocument = this.processor.process(document);
    this.chunks = this.chunker.chunk(document, this.processedDocument);
    this.repository.save(this.chunks, this.buildContextFromChunks(this.chunks));
  }

  getFullContext(): string {
    return this.repository.getAggregatedContent();
  }

  hasInformation(question: string): boolean {
    return this.processor.hasInformation(this.processedDocument, question);
  }

  getAllChunks(): KnowledgeChunk[] {
    return this.repository.getChunks();
  }

  getChunksForQuestion(_question: string): KnowledgeChunk[] {
    // Estrategia inicial: devolver todos los chunks. Se dejará lista para filtros futuros.
    return this.repository.getChunks();
  }

  getContextFromChunks(chunks: KnowledgeChunk[] = this.chunks): string {
    return this.buildContextFromChunks(chunks);
  }

  buildSystemPrompt(chunks?: KnowledgeChunk[]): string {
    const knowledge = chunks?.length ? this.buildContextFromChunks(chunks) : this.getFullContext();
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

  private buildContextFromChunks(chunks: KnowledgeChunk[] = this.repository.getChunks()): string {
    return chunks.map((chunk) => chunk.content).filter(Boolean).join("\n---\n");
  }
}

export const knowledgeService = new KnowledgeService(
  new FileKnowledgeSource(),
  simpleKnowledgeProcessor,
  simpleKnowledgeChunker,
  new InMemoryKnowledgeRepository()
);
