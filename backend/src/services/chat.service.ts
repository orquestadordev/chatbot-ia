import { OllamaClient, ollamaClient } from "../clients/ollama.client";
import { StreamChatParams } from "../types/chat.types";

export class ChatService {
  constructor(private readonly client: OllamaClient = ollamaClient) {}

  async streamChat(params: StreamChatParams): Promise<void> {
    const { message, abortSignal, onToken } = params;

    for await (const token of this.client.streamCompletion(message, abortSignal)) {
      await onToken(token);
    }
  }
}

export const chatService = new ChatService();
