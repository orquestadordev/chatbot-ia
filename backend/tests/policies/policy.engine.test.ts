// @ts-nocheck

import { PolicyEngine } from "../../src/policies/policy.engine";
import { InputGuardResult } from "../../src/services/input-guard.service";

const buildGuardResult = (overrides: Partial<InputGuardResult> = {}): InputGuardResult => ({
  riskLevel: "LOW",
  detectedPatterns: [],
  reason: "",
  ...overrides
});

describe("PolicyEngine", () => {
  const engine = new PolicyEngine();

  it("permite inputs seguros por defecto", () => {
    const result = engine.evaluate(buildGuardResult());
    expect(result.decision.action).toBe("ALLOW");
  });

  it("aplica SAFE_RESPONSE para prompt injection high risk", () => {
    const result = engine.evaluate(
      buildGuardResult({ riskLevel: "HIGH", detectedPatterns: ["PROMPT_INJECTION:regex"] })
    );
    expect(result.decision.action).toBe("SAFE_RESPONSE");
    expect(result.decision.policyName).toBe("KNOWLEDGE_BOUNDARY");
  });

  it("aplica SAFE_RESPONSE para patrones de override aunque el riesgo sea medio", () => {
    const result = engine.evaluate(
      buildGuardResult({ riskLevel: "MEDIUM", detectedPatterns: ["HEURISTIC:MULTI_INSTRUCTION"] })
    );
    expect(result.decision.policyName).toBe("INSTRUCTION_OVERRIDE");
  });
});
