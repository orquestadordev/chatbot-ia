// @ts-nocheck

import { resolve } from "path";
import { FileKnowledgeSource } from "../../src/knowledge/sources/file-knowledge.source";
import { SimpleKnowledgeProcessor } from "../../src/knowledge/processors/simple-knowledge.processor";
import { SimpleKnowledgeChunker } from "../../src/knowledge/chunkers/simple-knowledge.chunker";
import { KnowledgeDocument } from "../../src/knowledge/knowledge.types";

const normalize = (text: string): string =>
  text
    .replace(/-{3}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

describe("SimpleKnowledgeChunker integrity", () => {
  const knowledgePath = resolve(__dirname, "../../knowledge/knowledge.md");
  const source = new FileKnowledgeSource(knowledgePath);
  const processor = new SimpleKnowledgeProcessor();
  const chunker = new SimpleKnowledgeChunker();

  const document = source.load();
  const processed = processor.process(document);
  const chunks = chunker.chunk(document, processed);

  it("genera chunks con contenido único, no vacío e IDs únicos", () => {
    expect(chunks.length).toBeGreaterThan(0);

    const ids = new Set<string>();
    const contents = new Set<string>();

    chunks.forEach((chunk) => {
      expect(chunk.id).toBeTruthy();
      expect(chunk.content.trim().length).toBeGreaterThan(0);
      ids.add(chunk.id);
      contents.add(chunk.content);
    });

    expect(ids.size).toBe(chunks.length);
    expect(contents.size).toBe(chunks.length);
  });

  it("mantiene la equivalencia semántica al reconstruir el texto completo", () => {
    const reconstructed = chunks.map((chunk) => chunk.content).join("\n\n");
    expect(normalize(reconstructed)).toBe(normalize(document.content));
  });

  it("respeta el orden de las secciones markdown", () => {
    const productoIndex = chunks.findIndex((chunk) => chunk.content.includes("## Producto"));
    const capacidadesIndex = chunks.findIndex((chunk) => chunk.content.includes("## Capacidades"));
    const limitacionesIndex = chunks.findIndex((chunk) => chunk.content.includes("## Limitaciones"));

    expect(productoIndex).toBeGreaterThanOrEqual(0);
  expect(capacidadesIndex).toBeGreaterThan(productoIndex);
  expect(limitacionesIndex).toBeGreaterThanOrEqual(capacidadesIndex);

    const orders = chunks.map((chunk) => chunk.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it("respeta el tamaño máximo de chunk y no trunca palabras", () => {
    const aggressiveChunker = new SimpleKnowledgeChunker(120);
    const testChunks = aggressiveChunker.chunk(document, processed);

    testChunks.forEach((chunk) => {
      expect(chunk.content.length).toBeLessThanOrEqual(120);
    });

    const reconstructed = testChunks.map((chunk) => chunk.content).join(" ");
    expect(normalize(reconstructed)).toBe(normalize(document.content));
  });

  it("maneja párrafos sintéticos largos sin perder información", () => {
    const longParagraph =
      "## Sección Larga\n" +
      "AndesGPT es un asistente local que corre sobre Ollama y provee respuestas sobre arquitectura. ".repeat(10);

    const syntheticDocument: KnowledgeDocument = {
      content: longParagraph,
      metadata: { source: "synthetic.md", loadedAt: new Date() }
    };

    const syntheticProcessed = processor.process(syntheticDocument);
    const syntheticChunks = new SimpleKnowledgeChunker(150).chunk(syntheticDocument, syntheticProcessed);

    syntheticChunks.forEach((chunk) => {
      expect(chunk.content.length).toBeLessThanOrEqual(150);
      expect(chunk.content).toMatch(/^[^\s].*[^\s]$/);
    });

    const syntheticReconstructed = syntheticChunks.map((chunk) => chunk.content).join(" ");
    expect(normalize(syntheticReconstructed)).toBe(normalize(longParagraph));
  });
});
