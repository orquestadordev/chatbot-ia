import { OllamaClient, ollamaClient } from "../clients/ollama.client";
import { StreamChatParams } from "../types/chat.types";
import { KnowledgeChunk } from "../knowledge/knowledge.types";
import { KnowledgeChunkSelector } from "../knowledge/chunk-selectors/knowledge-chunk.selector";
import { keywordKnowledgeChunkSelector } from "../knowledge/chunk-selectors/keyword.chunk-selector";
import { runtimeKnowledgeStore, RuntimeKnowledgeStore } from "../knowledge/store/runtime-knowledge.store";
import { KnowledgeService, knowledgeService } from "./knowledge.service";
import { InputGuardService, inputGuardService } from "./input-guard.service";
import { PolicyEngine, policyEngine } from "../policies/policy.engine";
import { SafeResponseFactory } from "./safe-response.factory";

type MaybeQuestion = string | undefined | null;

export class ChatService {
  constructor(
    private readonly client: OllamaClient = ollamaClient,
    private readonly knowledge: KnowledgeService = knowledgeService,
    private readonly inputGuard: InputGuardService = inputGuardService,
    private readonly policies: PolicyEngine = policyEngine,
    private readonly safeResponseFactory: SafeResponseFactory = new SafeResponseFactory(),
    private readonly runtimeStore: RuntimeKnowledgeStore = runtimeKnowledgeStore,
    private readonly runtimeChunkSelector: KnowledgeChunkSelector = keywordKnowledgeChunkSelector
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

    const baseKnowledgeContent = this.knowledge.getFullContext();
    const runtimeKnowledgeContent = this.runtimeStore.getAggregatedContent();
    const runtimeChunks = this.runtimeStore.getChunks();

    if (!baseKnowledgeContent && !runtimeKnowledgeContent) {
      await onToken(this.knowledge.getFallbackResponse());
      return;
    }

    const hasBaseInformation = this.knowledge.hasInformation(message);
    const hasRuntimeKnowledge = runtimeChunks.length > 0;

    if (!hasBaseInformation && !hasRuntimeKnowledge) {
      await onToken(this.knowledge.getFallbackResponse());
      return;
    }

    const baseChunks = hasBaseInformation ? this.knowledge.getChunksForQuestion(message) : [];
    const runtimeRelevantChunks = this.selectRuntimeChunks(message, runtimeChunks);
    const chunks = this.mergeChunks(baseChunks, runtimeRelevantChunks);
    const promptChunks = chunks.length ? chunks : runtimeChunks.length ? runtimeChunks : baseChunks;

    const promptPayload = {
      prompt: this.knowledge.buildUserPrompt(message),
      system: this.knowledge.buildSystemPrompt(promptChunks)
    };

    for await (const token of this.client.streamCompletion(promptPayload, abortSignal)) {
      await onToken(token);
    }
  }

  private selectRuntimeChunks(question: MaybeQuestion, chunks: KnowledgeChunk[]): KnowledgeChunk[] {
    if (!chunks.length) {
      return [];
    }

    const trimmedQuestion = question?.trim();
    if (!trimmedQuestion) {
      return chunks;
    }

    const selected = this.runtimeChunkSelector.select(trimmedQuestion, chunks);
    return selected.length ? selected : chunks;
  }

  private mergeChunks(primary: KnowledgeChunk[], secondary: KnowledgeChunk[]): KnowledgeChunk[] {
    const merged: KnowledgeChunk[] = [];
    const seen = new Set<string>();

    for (const chunk of [...primary, ...secondary]) {
      if (!chunk?.content?.trim()) {
        continue;
      }

      if (seen.has(chunk.id)) {
        continue;
      }

      seen.add(chunk.id);
      merged.push(chunk);
    }

    return merged;
  }
}

export const chatService = new ChatService();
