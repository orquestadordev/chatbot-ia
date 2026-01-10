import { PolicyDefinition } from './policy.types'

export const POLICIES: PolicyDefinition[] = [
  {
    name: "KNOWLEDGE_BOUNDARY",
    conditions: {
      minRiskLevel: "HIGH",
      patternIncludes: ["PROMPT_INJECTION", "ROLE_HIJACKING", "EXTERNAL_SOURCE"]
    },
    action: "SAFE_RESPONSE"
  },
  {
    name: "IDENTITY_INTEGRITY",
    conditions: {
      minRiskLevel: "MEDIUM",
      patternIncludes: ["PROMPT_INJECTION"]
    },
    action: "SAFE_RESPONSE"
  },
  {
    name: "INSTRUCTION_OVERRIDE",
    conditions: {
      patternIncludes: ["SYSTEM_OVERRIDE", "HEURISTIC_MULTI_INSTRUCTION"]
    },
    action: "SAFE_RESPONSE"
  }
];
