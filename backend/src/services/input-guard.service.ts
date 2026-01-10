import { INPUT_GUARD_HEURISTICS, INPUT_GUARD_PATTERNS } from "../constants/input-guard.constants";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface InputGuardResult {
  riskLevel: RiskLevel;
  detectedPatterns: string[];
  reason: string;
}

export class InputGuardService {
  analyze(message: string): InputGuardResult {
    if (!message?.trim()) {
      return this.buildResult("LOW", [], "Empty or whitespace-only input");
    }

    const normalized = message.trim();
    const patternHits = this.detectPatterns(normalized);
    const heuristicHits = this.applyHeuristics(normalized);

    const allFindings = [...patternHits, ...heuristicHits];
    const riskLevel = this.calculateRiskLevel(patternHits.length, heuristicHits.length);

    return this.buildResult(riskLevel, allFindings, this.buildReason(patternHits, heuristicHits));
  }

  private detectPatterns(message: string): string[] {
    const matches: string[] = [];

    Object.entries(INPUT_GUARD_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach((regex) => {
        if (regex.test(message)) {
          matches.push(`${category}:${regex}`);
        }
      });
    });

    return matches;
  }

  private applyHeuristics(message: string): string[] {
    const hits: string[] = [];

    if (message.length > INPUT_GUARD_HEURISTICS.MAX_SAFE_LENGTH) {
      hits.push("HEURISTIC:EXCESSIVE_LENGTH");
    }

    const instructionCount = this.countImperatives(message);
    if (instructionCount >= INPUT_GUARD_HEURISTICS.MULTI_INSTRUCTION_THRESHOLD) {
      hits.push("HEURISTIC:MULTI_INSTRUCTION");
    }

    return hits;
  }

  private countImperatives(message: string): number {
    const imperativeRegex = /(por favor|haz|hazlo|hazlo ahora|realiza|ejecuta|ignora|olvida|responde|actúa|deja)/gi;
    return (message.match(imperativeRegex) ?? []).length;
  }

  private calculateRiskLevel(patternHits: number, heuristicHits: number): RiskLevel {
    if (patternHits >= 2 || (patternHits >= 1 && heuristicHits >= 1)) {
      return "HIGH";
    }

    if (patternHits === 1 || heuristicHits >= 2) {
      return "MEDIUM";
    }

    if (heuristicHits === 1) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private buildReason(patternHits: string[], heuristicHits: string[]): string {
    if (!patternHits.length && !heuristicHits.length) {
      return "No suspicious patterns detected";
    }

    const segments: string[] = [];
    if (patternHits.length) {
      segments.push(`Pattern matches: ${patternHits.join(", ")}`);
    }
    if (heuristicHits.length) {
      segments.push(`Heuristics: ${heuristicHits.join(", ")}`);
    }

    return segments.join(" | ");
  }

  private buildResult(riskLevel: RiskLevel, detectedPatterns: string[], reason: string): InputGuardResult {
    return {
      riskLevel,
      detectedPatterns,
      reason
    };
  }
}

export const inputGuardService = new InputGuardService();
