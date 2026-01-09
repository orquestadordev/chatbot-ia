// @ts-nocheck

import request from "supertest";
import { ANSWERABLE_CASES, FALLBACK_CASES } from "./questions";
import { extractSSEPayload, concatenatePayload } from "../utils/sse.helper";
import { KNOWLEDGE_FALLBACK_RESPONSE } from "../../src/constants/prompt.constants";

jest.mock("../../src/clients/ollama.client", () => {
  class MockOllamaClient {
    async *streamCompletion(payload: { prompt: string; system?: string }) {
      const question = payload.prompt.toLowerCase();

      if (question.includes("cómo se llama")) {
        yield "El asistente se llama AndesGPT y opera localmente.";
        return;
      }

      if (question.includes("endpoint")) {
        yield "El backend expone el endpoint /api/chat via SSE.";
        return;
      }

      yield "Respuesta genérica basada en conocimiento.";
    }
  }

  const client = new MockOllamaClient();
  return {
    OllamaClient: MockOllamaClient,
    ollamaClient: client
  };
});

// Importar después del mock para que Express use el cliente simulado.
// eslint-disable-next-line import/first
import app from "../../src/app";

const agent = request(app);

const expectResponseContains = (payload: string, terms: string[]) => {
  for (const term of terms) {
    expect(payload).toEqual(expect.stringContaining(term));
  }
};

const expectResponseExcludes = (payload: string, terms: string[] = []) => {
  for (const term of terms) {
    expect(payload).not.toEqual(expect.stringContaining(term));
  }
};

describe("/api/chat knowledge regression", () => {
  describe("knowledge-backed questions", () => {
    ANSWERABLE_CASES.forEach((testCase) => {
      it(`responde usando conocimiento: ${testCase.name}`, async () => {
        const response = await agent.post("/api/chat").send({ message: testCase.question });

        expect(response.status).toBe(200);
        const payload = concatenatePayload(extractSSEPayload(response.text));
        expectResponseContains(payload, testCase.mustInclude);
        expectResponseExcludes(payload, testCase.mustExclude);
      });
    });
  });

  describe("questions outside knowledge", () => {
    FALLBACK_CASES.forEach((testCase) => {
      it(`aplica fallback cuando no hay datos: ${testCase.name}`, async () => {
        const response = await agent.post("/api/chat").send({ message: testCase.question });

        expect(response.status).toBe(200);
        const payload = concatenatePayload(extractSSEPayload(response.text));
        expect(payload).toEqual(expect.stringContaining(KNOWLEDGE_FALLBACK_RESPONSE));
        expectResponseContains(payload, testCase.mustInclude);
        expectResponseExcludes(payload, testCase.mustExclude);
      });
    });
  });
});
