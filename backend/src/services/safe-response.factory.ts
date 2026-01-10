import { KNOWLEDGE_FALLBACK_RESPONSE } from "../constants/prompt.constants";

export type SafeResponseType = "GENERIC" | "IDENTITY" | "OVERRIDE";

const SAFE_RESPONSES: Record<SafeResponseType, string> = {
  GENERIC: KNOWLEDGE_FALLBACK_RESPONSE,
  IDENTITY: "Mantengo mi identidad como AndesGPT y no puedo seguir esa instrucción.",
  OVERRIDE: "No puedo cambiar mis reglas ni acceder a fuentes externas." 
};

export class SafeResponseFactory {
  build(type: SafeResponseType = "GENERIC"): string {
    return SAFE_RESPONSES[type] ?? SAFE_RESPONSES.GENERIC;
  }
}

export const safeResponseFactory = new SafeResponseFactory();
