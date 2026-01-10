// @ts-nocheck

import request from "supertest";
import { ANSWERABLE_CASES, FALLBACK_CASES, IDENTITY_CASES } from "./questions";
import { extractSSEPayload, concatenatePayload } from "../utils/sse.helper";
import { KNOWLEDGE_FALLBACK_RESPONSE } from "../../src/constants/prompt.constants";

jest.mock("../../src/clients/ollama.client", () => {
  class MockOllamaClient {
    async *streamCompletion(payload: { prompt: string; system?: string }) {
      const question = payload.prompt.toLowerCase();

      if (question.includes("cómo se llama") || question.includes("cómo te llamas")) {
        yield "Hola, soy AndesGPT y estoy acá para ayudarte.";
        return;
      }

      if (question.includes("quién sos")) {
        yield "Soy AndesGPT, un asistente local basado en Ollama.";
        return;
      }

      if (question.includes("pregunta del usuario: hola")) {
        yield "Hola, soy AndesGPT. ¿En qué te ayudo?";
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

const expectResponseMatches = (payload: string, patterns: RegExp[] = []) => {
  for (const pattern of patterns) {
    expect(payload).toMatch(pattern);
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
        expectResponseMatches(payload, testCase.mustMatch);
      });
    });
  });

  describe("identity and conversational tone", () => {
    IDENTITY_CASES.forEach((testCase) => {
      it(`mantiene identidad en ${testCase.name}`, async () => {
        const response = await agent.post("/api/chat").send({ message: testCase.question });

        expect(response.status).toBe(200);
        const payload = concatenatePayload(extractSSEPayload(response.text));
        expectResponseContains(payload, testCase.mustInclude);
        expectResponseExcludes(payload, testCase.mustExclude);
        expectResponseMatches(payload, testCase.mustMatch);
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
        expectResponseMatches(payload, testCase.mustMatch);
      });
    });
  });
});
