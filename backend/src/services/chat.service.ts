import { OllamaClient, ollamaClient } from "../clients/ollama.client";
import { StreamChatParams } from "../types/chat.types";
import { KnowledgeService, knowledgeService } from "./knowledge.service";
import { InputGuardService, inputGuardService } from "./input-guard.service";
import { PolicyEngine, policyEngine } from "../policies/policy.engine";
import { SafeResponseFactory } from "./safe-response.factory";

export class ChatService {
  constructor(
    private readonly client: OllamaClient = ollamaClient,
    private readonly knowledge: KnowledgeService = knowledgeService,
    private readonly inputGuard: InputGuardService = inputGuardService,
    private readonly policies: PolicyEngine = policyEngine,
    private readonly safeResponseFactory: SafeResponseFactory = new SafeResponseFactory()
  ) {}

  async streamChat(params: StreamChatParams): Promise<void> {
    const { message, abortSignal, onToken } = params;

    const guardResult = this.inputGuard.analyze(message);
    const policyOutcome = this.policies.evaluate(guardResult);

    if (policyOutcome.decision.action === "BLOCK") {
      return;
    }

    if (policyOutcome.decision.action === "SAFE_RESPONSE") {
      await onToken(this.safeResponseFactory.build());
      return;
    }

    const knowledgeContent = this.knowledge.getFullContext();

    if (!knowledgeContent) {
      await onToken(this.knowledge.getFallbackResponse());
      return;
    }

    if (!this.knowledge.hasInformation(message)) {
      await onToken(this.knowledge.getFallbackResponse());
      return;
    }

    const chunks = this.knowledge.getChunksForQuestion(message);

    const promptPayload = {
      prompt: this.knowledge.buildUserPrompt(message),
      system: this.knowledge.buildSystemPrompt(chunks)
    };

    for await (const token of this.client.streamCompletion(promptPayload, abortSignal)) {
      await onToken(token);
    }
  }
}

export const chatService = new ChatService();
