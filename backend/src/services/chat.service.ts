import { OllamaClient, ollamaClient } from "../clients/ollama.client";
import { StreamChatParams } from "../types/chat.types";
import { KnowledgeService, knowledgeService } from "./knowledge.service";

export class ChatService {
  constructor(
    private readonly client: OllamaClient = ollamaClient,
    private readonly knowledge: KnowledgeService = knowledgeService
  ) {}

  async streamChat(params: StreamChatParams): Promise<void> {
    const { message, abortSignal, onToken } = params;

    const knowledgeContent = this.knowledge.getFullContext();

    if (!knowledgeContent) {
      await onToken(this.knowledge.getFallbackResponse());
      return;
    }

    if (!this.knowledge.hasInformation(message)) {
      await onToken(this.knowledge.getFallbackResponse());
      return;
    }

    const promptPayload = {
      prompt: this.knowledge.buildUserPrompt(message),
      system: this.knowledge.buildSystemPrompt()
    };

    for await (const token of this.client.streamCompletion(promptPayload, abortSignal)) {
      await onToken(token);
    }
  }
}

export const chatService = new ChatService();
