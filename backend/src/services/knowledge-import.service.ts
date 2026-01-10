import { KnowledgeImporter } from "../knowledge/importers/knowledge-importer";
import { markdownKnowledgeImporter } from "../knowledge/importers/markdown.knowledge-importer";
import { textKnowledgeImporter } from "../knowledge/importers/text.knowledge-importer";
import { KnowledgeNormalizer, basicKnowledgeNormalizer } from "../knowledge/normalizers/knowledge.normalizer";
import { runtimeKnowledgeChunker } from "../knowledge/chunkers/runtime-knowledge.chunker";
import { RuntimeKnowledgeStore, runtimeKnowledgeStore } from "../knowledge/store/runtime-knowledge.store";
import { KnowledgeChunk, KnowledgeImportFile } from "../knowledge/knowledge.types";

export interface KnowledgeImportSummary {
  importedFiles: number;
  totalChunks: number;
  sources: string[];
  errors: KnowledgeImportError[];
}

export interface KnowledgeImportError {
  source: string;
  message: string;
}

export class UnsupportedKnowledgeFileError extends Error {
  constructor(filename: string) {
    super(`El archivo ${filename} no tiene un importador disponible`);
  }
}

export class EmptyKnowledgeContentError extends Error {
  constructor(filename: string) {
    super(`El archivo ${filename} no contenía información aprovechable`);
  }
}

export class KnowledgeImportService {
  constructor(
    private readonly importers: KnowledgeImporter[] = [textKnowledgeImporter, markdownKnowledgeImporter],
    private readonly normalizer: KnowledgeNormalizer = basicKnowledgeNormalizer,
    private readonly chunker = runtimeKnowledgeChunker,
    private readonly store: RuntimeKnowledgeStore = runtimeKnowledgeStore
  ) {}

  async importFiles(files: UploadedFile[]): Promise<KnowledgeImportSummary> {
    const uploadFiles = this.mapFiles(files);
    if (!uploadFiles.length) {
      throw new Error("No se recibieron archivos para importar");
    }

    const summary: KnowledgeImportSummary = {
      importedFiles: 0,
      totalChunks: 0,
      sources: [],
      errors: []
    };

    for (const file of uploadFiles) {
      try {
        const importer = this.resolveImporter(file);
        if (!importer) {
          throw new UnsupportedKnowledgeFileError(file.originalName);
        }

        const raw = await importer.extract(file);
        const normalized = this.normalizer.normalize(raw);
        const chunks = this.chunker.chunk(normalized);
        const sanitizedChunks = this.enforceChunkIntegrity(chunks);

        if (!sanitizedChunks.length) {
          throw new EmptyKnowledgeContentError(file.originalName);
        }

        this.store.addChunks(sanitizedChunks, normalized.importedAt);

        summary.importedFiles += 1;
        summary.totalChunks += sanitizedChunks.length;
        summary.sources.push(normalized.source);
      } catch (error) {
        summary.errors.push({
          source: file.originalName,
          message: error instanceof Error ? error.message : "Error desconocido al importar"
        });
      }
    }

    return summary;
  }

  clearStore(): void {
    this.store.clear();
  }

  private mapFiles(files: UploadedFile[]): KnowledgeImportFile[] {
    return (files ?? []).map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer
    }));
  }

  private resolveImporter(file: KnowledgeImportFile): KnowledgeImporter | undefined {
    return this.importers.find((importer) => importer.supports(file));
  }

  private enforceChunkIntegrity(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
    const unique = new Map<string, KnowledgeChunk>();
    for (const chunk of chunks) {
      const contentKey = chunk.content.trim();
      if (!contentKey) {
        continue;
      }
      if (!unique.has(contentKey)) {
        unique.set(contentKey, chunk);
      }
    }
    return Array.from(unique.values());
  }
}

export const knowledgeImportService = new KnowledgeImportService();

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}
