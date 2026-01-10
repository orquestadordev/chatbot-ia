// @ts-nocheck
import path from "node:path";
import request from "supertest";
import app from "../../src/app";
import { runtimeKnowledgeStore } from "../../src/knowledge/store/runtime-knowledge.store";
import { knowledgeImportService } from "../../src/services/knowledge-import.service";

const fixturesDir = path.resolve(__dirname, "../fixtures/knowledge");
const txtFixture = path.join(fixturesDir, "notes.txt");
const mdFixture = path.join(fixturesDir, "history.md");
const csvFixture = path.join(fixturesDir, "unsupported.csv");

describe("POST /api/knowledge/import", () => {
  beforeEach(() => {
    runtimeKnowledgeStore.clear();
  });

  it("importa correctamente un archivo TXT", async () => {
    const response = await request(app).post("/api/knowledge/import").attach("files", txtFixture);

    expect(response.status).toBe(200);
    expect(response.body.importedFiles).toBe(1);
    expect(response.body.totalChunks).toBeGreaterThan(0);
    expect(response.body.sources).toContain("notes.txt");
    expect(response.body.errors).toHaveLength(0);

    const chunks = runtimeKnowledgeStore.getChunks();
    expect(chunks.length).toBe(response.body.totalChunks);
    expect(chunks.every((chunk) => chunk.content.trim().length > 0)).toBe(true);
  });

  it("importa correctamente un archivo Markdown", async () => {
    const response = await request(app).post("/api/knowledge/import").attach("files", mdFixture);

    expect(response.status).toBe(200);
    expect(response.body.importedFiles).toBe(1);
    expect(response.body.sources).toContain("history.md");

    const chunks = runtimeKnowledgeStore.getChunks();
    const chunkTexts = chunks.map((chunk) => chunk.content);
    expect(new Set(chunkTexts).size).toBe(chunkTexts.length);
  });

  it("rechaza archivos no soportados", async () => {
    const response = await request(app).post("/api/knowledge/import").attach("files", csvFixture);

    expect(response.status).toBe(200);
    expect(response.body.importedFiles).toBe(0);
    expect(response.body.totalChunks).toBe(0);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].source).toBe("unsupported.csv");
  });

  it("permite limpiar el knowledge store luego de importar", async () => {
    await request(app)
      .post("/api/knowledge/import")
      .attach("files", txtFixture)
      .attach("files", mdFixture);

    expect(runtimeKnowledgeStore.getChunks().length).toBeGreaterThan(0);

    knowledgeImportService.clearStore();

    expect(runtimeKnowledgeStore.getChunks()).toHaveLength(0);
  });
});
