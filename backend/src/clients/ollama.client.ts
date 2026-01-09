import {
  OLLAMA_BASE_URL,
  OLLAMA_DEFAULT_HEADERS,
  OLLAMA_DEFAULT_MODEL,
  OLLAMA_ENDPOINTS
} from "../constants/ollama.constants";
import { OllamaGenerateRequest, OllamaStreamChunk, StreamCompletionPayload } from "../types/chat.types";

const decoder = new TextDecoder();

export class OllamaClient {
  constructor(private readonly baseUrl: string = OLLAMA_BASE_URL) {}

  async *streamCompletion(
    payload: StreamCompletionPayload,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const requestBody: OllamaGenerateRequest = {
      model: OLLAMA_DEFAULT_MODEL,
      prompt: payload.prompt,
      stream: true,
      ...(payload.system ? { system: payload.system } : {})
    };

    const response = await fetch(`${this.baseUrl}${OLLAMA_ENDPOINTS.GENERATE}`, {
      method: "POST",
      headers: OLLAMA_DEFAULT_HEADERS,
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    let buffer = "";

    try {
      // Process newline-delimited JSON chunks from Ollama.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line) continue;

          let chunk: OllamaStreamChunk;
          try {
            chunk = JSON.parse(line);
          } catch (error) {
            console.warn("Failed to parse Ollama chunk", { line, error });
            continue;
          }

          if (chunk.error) {
            throw new Error(chunk.error);
          }

          if (chunk.response) {
            yield chunk.response;
          }

          if (chunk.done) {
            return;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const ollamaClient = new OllamaClient();
