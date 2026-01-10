import { KnowledgeChunk } from "../knowledge.types";

export interface RuntimeKnowledgeMetadata {
  source: string;
  importedAt: Date;
  chunkCount: number;
}

export class RuntimeKnowledgeStore {
  private chunks: KnowledgeChunk[] = [];
  private metadata = new Map<string, RuntimeKnowledgeMetadata>();
  private importSequence = 0;

  addChunks(chunks: KnowledgeChunk[], importedAt: Date): void {
    if (!chunks.length) {
      return;
    }

    const source = chunks[0].source;
    this.removeSource(source);

    const baseOrder = ++this.importSequence * 10_000;
    const normalizedChunks = chunks.map((chunk, index) => ({
      ...chunk,
      order: baseOrder + index,
    }));

    this.chunks.push(...normalizedChunks);
    this.metadata.set(source, {
      source,
      importedAt,
      chunkCount: normalizedChunks.length
    });
  }

  clear(): void {
    this.chunks = [];
    this.metadata.clear();
    this.importSequence = 0;
  }

  getChunks(): KnowledgeChunk[] {
    return [...this.chunks].sort((a, b) => a.order - b.order);
  }

  getAggregatedContent(): string {
    return this.getChunks()
      .map((chunk) => chunk.content)
      .filter(Boolean)
      .join("\n---\n");
  }

  getSources(): string[] {
    return Array.from(this.metadata.keys());
  }

  listMetadata(): RuntimeKnowledgeMetadata[] {
    return Array.from(this.metadata.values()).sort(
      (a, b) => a.importedAt.getTime() - b.importedAt.getTime()
    );
  }

  private removeSource(source: string): void {
    if (!source) {
      return;
    }
    this.chunks = this.chunks.filter((chunk) => chunk.source !== source);
    this.metadata.delete(source);
  }
}

export const runtimeKnowledgeStore = new RuntimeKnowledgeStore();
