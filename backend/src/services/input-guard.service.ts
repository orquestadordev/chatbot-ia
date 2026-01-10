import {
  INPUT_GUARD_HEURISTICS_CONFIG,
  INPUT_GUARD_PATTERN_DEFINITIONS,
  INPUT_GUARD_RISK_THRESHOLDS,
  InputGuardPatternDefinition,
  InputGuardSignalType
} from "../constants/input-guard.constants";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface InputGuardSignal {
  id: string;
  type: InputGuardSignalType;
  description: string;
  score: number;
}

export interface InputGuardResult {
  totalScore: number;
  riskLevel: RiskLevel;
  detectedSignals: InputGuardSignal[];
  detectedPatterns: string[];
  explanation: string;
}

const NO_SIGNAL_EXPLANATION = "No suspicious signals detected";

export class InputGuardService {
  analyze(message: string): InputGuardResult {
    if (!message?.trim()) {
      return this.buildResult([], "Input vacío o sin contenido significativo");
    }

    const normalized = message.trim();
    const patternSignals = this.detectPatternSignals(normalized);
    const heuristicSignals = this.detectHeuristicSignals(normalized, patternSignals.length);
    const signals = [...patternSignals, ...heuristicSignals];

    return this.buildResult(signals);
  }

  private detectPatternSignals(message: string): InputGuardSignal[] {
    const signals: InputGuardSignal[] = [];

    INPUT_GUARD_PATTERN_DEFINITIONS.forEach((definition) => {
      if (this.matchesPattern(definition.regex, message)) {
        signals.push(this.buildSignalFromPattern(definition));
      }
    });

    return signals;
  }

  private detectHeuristicSignals(message: string, patternSignalCount: number): InputGuardSignal[] {
    const signals: InputGuardSignal[] = [];
    const normalized = message.toLowerCase();

    const imperativeMatches = this.countImperatives(normalized);

    if (imperativeMatches >= INPUT_GUARD_HEURISTICS_CONFIG.STRONG_IMPERATIVE.minMatches) {
      signals.push(
        this.buildHeuristicSignal(
          INPUT_GUARD_HEURISTICS_CONFIG.STRONG_IMPERATIVE,
          `Coincidencias: ${imperativeMatches}`
        )
      );
    }

    if (imperativeMatches >= INPUT_GUARD_HEURISTICS_CONFIG.MULTI_INSTRUCTION.threshold) {
      signals.push(this.buildHeuristicSignal(INPUT_GUARD_HEURISTICS_CONFIG.MULTI_INSTRUCTION));
    }

    if (message.length > INPUT_GUARD_HEURISTICS_CONFIG.EXCESSIVE_LENGTH.maxLength) {
      signals.push(
        this.buildHeuristicSignal(
          INPUT_GUARD_HEURISTICS_CONFIG.EXCESSIVE_LENGTH,
          `Largo: ${message.length}`
        )
      );
    }

    if (patternSignalCount >= INPUT_GUARD_HEURISTICS_CONFIG.PATTERN_COMBO.minPatterns) {
      signals.push(this.buildHeuristicSignal(INPUT_GUARD_HEURISTICS_CONFIG.PATTERN_COMBO));
    }

    return signals;
  }

  private matchesPattern(regex: RegExp, message: string): boolean {
    regex.lastIndex = 0;
    return regex.test(message);
  }

  private buildSignalFromPattern(definition: InputGuardPatternDefinition): InputGuardSignal {
    return {
      id: definition.id,
      type: definition.type,
      description: definition.description,
      score: definition.score
    };
  }

  private buildHeuristicSignal(
    config: typeof INPUT_GUARD_HEURISTICS_CONFIG[keyof typeof INPUT_GUARD_HEURISTICS_CONFIG],
    details?: string
  ): InputGuardSignal {
    const description = details ? `${config.description} (${details})` : config.description;
    return {
      id: config.id,
      type: config.type,
      description,
      score: config.score
    };
  }

  private countImperatives(message: string): number {
    const keywords = INPUT_GUARD_HEURISTICS_CONFIG.STRONG_IMPERATIVE.keywords.join("|");
    const imperativeRegex = new RegExp(`\\b(${keywords})\\b`, "gi");
    return (message.match(imperativeRegex) ?? []).length;
  }

  private calculateRiskLevel(totalScore: number): RiskLevel {
    if (totalScore >= INPUT_GUARD_RISK_THRESHOLDS.HIGH) {
      return "HIGH";
    }

    if (totalScore >= INPUT_GUARD_RISK_THRESHOLDS.MEDIUM) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private buildResult(signals: InputGuardSignal[], explanationOverride?: string): InputGuardResult {
    const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);
    const riskLevel = this.calculateRiskLevel(totalScore);
    const explanation = explanationOverride
      ? explanationOverride
      : signals.length
          ? signals.map((signal) => `${signal.id}(+${signal.score})`).join("; ")
          : NO_SIGNAL_EXPLANATION;

    return {
      totalScore,
      riskLevel,
      detectedSignals: signals,
      detectedPatterns: signals.map((signal) => `${signal.type}:${signal.id}`),
      explanation
    };
  }
}

export const inputGuardService = new InputGuardService();
