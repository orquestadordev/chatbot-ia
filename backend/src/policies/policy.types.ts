import { InputGuardResult } from "../services/input-guard.service";

export type PolicyAction = "ALLOW" | "BLOCK" | "SAFE_RESPONSE";

export interface PolicyConditions {
  minRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  patternIncludes?: string[];
}

export interface PolicyDefinition {
  name: string;
  conditions: PolicyConditions;
  action: PolicyAction;
}

export interface PolicyDecision {
  policyName: string;
  action: PolicyAction;
  reason: string;
}

export interface PolicyEngineResult {
  decision: PolicyDecision;
  guardResult: InputGuardResult;
}
