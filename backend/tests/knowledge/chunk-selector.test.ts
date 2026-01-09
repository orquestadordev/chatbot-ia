// @ts-nocheck

import { KeywordKnowledgeChunkSelector } from "../../src/knowledge/chunk-selectors/keyword.chunk-selector";
import { KnowledgeChunk } from "../../src/knowledge/knowledge.types";

const mockChunks: KnowledgeChunk[] = [
  {
    id: "chunk-1",
    content: "Ollama corre modelos LLaMA localmente y soporta streaming SSE",
    order: 1,
    source: "test"
  },
  {
    id: "chunk-2",
    content: "La aplicación expone un endpoint /api/chat con Server-Sent Events (SSE)",
    order: 2,
    source: "test"
  },
  {
    id: "chunk-3",
    content: "Instala los modelos con ollama pull llama2 y configura la variable OLLAMA_BASE_URL",
    order: 3,
    source: "test"
  }
];

describe("KeywordKnowledgeChunkSelector", () => {
  it("selecciona los chunks con mayor score", () => {
    const selector = new KeywordKnowledgeChunkSelector({ maxChunks: 2 });

    const result = selector.select("¿Cómo habilito streaming SSE en el endpoint?", mockChunks);

    expect(result).toHaveLength(2);
    expect(result.map((chunk) => chunk.id)).toEqual(["chunk-1", "chunk-2"]);
  });

  it("respeta el puntaje mínimo cuando está configurado", () => {
    const selector = new KeywordKnowledgeChunkSelector({ maxChunks: 3, minScore: 2 });

    const result = selector.select("Configurar ollama pull y OLLAMA_BASE_URL", mockChunks);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("chunk-3");
  });

  it("incluye un fallback seguro cuando no hay coincidencias", () => {
    const selector = new KeywordKnowledgeChunkSelector({ maxChunks: 2 });

    const result = selector.select("pregunta sin relación", mockChunks);

    expect(result).toHaveLength(2);
    expect(result.map((chunk) => chunk.id)).toEqual(["chunk-1", "chunk-2"]);
  });
});
