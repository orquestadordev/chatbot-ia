import { InputGuardResult } from "../services/input-guard.service";
import { POLICIES } from "./policies.config";
import { PolicyAction, PolicyDecision, PolicyEngineResult, PolicyDefinition } from "./policy.types";

const RISK_ORDER = ["LOW", "MEDIUM", "HIGH"] as const;

type RiskLevel = (typeof RISK_ORDER)[number];

export class PolicyEngine {
  evaluate(guardResult: InputGuardResult): PolicyEngineResult {
    for (const policy of POLICIES) {
      if (this.matchesPolicy(policy, guardResult)) {
        return this.buildResult(policy, guardResult);
      }
    }

    return {
      decision: {
        policyName: "DEFAULT_ALLOW",
        action: "ALLOW",
        reason: "No policies matched"
      },
      guardResult
    };
  }

  private matchesPolicy(policy: PolicyDefinition, guardResult: InputGuardResult): boolean {
    const { conditions } = policy;

    if (conditions.minRiskLevel) {
      if (!this.isRiskAtLeast(guardResult.riskLevel as RiskLevel, conditions.minRiskLevel)) {
        return false;
      }
    }

    if (conditions.patternIncludes?.length) {
      const hasPattern = conditions.patternIncludes.some((pattern) =>
        guardResult.detectedPatterns.some((detected) => detected.includes(pattern))
      );
      if (!hasPattern) {
        return false;
      }
    }

    return true;
  }

  private isRiskAtLeast(actual: RiskLevel, threshold: RiskLevel): boolean {
    return RISK_ORDER.indexOf(actual) >= RISK_ORDER.indexOf(threshold);
  }

  private buildResult(policy: PolicyDefinition, guardResult: InputGuardResult): PolicyEngineResult {
    return {
      decision: {
        policyName: policy.name,
        action: policy.action,
        reason: `Matched policy ${policy.name}`
      },
      guardResult
    };
  }
}

export const policyEngine = new PolicyEngine();
