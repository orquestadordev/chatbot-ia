export type InputGuardSignalType =
  | "PROMPT_INJECTION"
  | "ROLE_HIJACKING"
  | "INSTRUCTION_OVERRIDE"
  | "INTERNAL_REFERENCE"
  | "EXTERNAL_SOURCE"
  | "HEURISTIC";

export interface InputGuardPatternDefinition {
  id: string;
  type: InputGuardSignalType;
  description: string;
  regex: RegExp;
  score: number;
}

const pattern = (
  type: InputGuardSignalType,
  id: string,
  description: string,
  regex: RegExp,
  score: number
): InputGuardPatternDefinition => ({ type, id, description, regex, score });

export const INPUT_GUARD_PATTERN_DEFINITIONS: InputGuardPatternDefinition[] = [
  // Prompt injection: intentos explícitos de ignorar reglas base
  pattern("PROMPT_INJECTION", "IGNORE_RULES", "Solicita ignorar las reglas del sistema", /\b(ignora|ignorá|ignore)\s+(tus|las|todas las)\s+reglas?\b/i, 5),
  pattern("PROMPT_INJECTION", "FORGET_IDENTITY", "Indica que el asistente olvide su identidad actual", /\b(olvida(?:te)?|olvid[aá])\s+(que\s+)?sos\b/i, 5),
  pattern("PROMPT_INJECTION", "ACT_AS", "Intenta que el asistente actúe como otro rol", /\bact[úu]a?\s+como\b/i, 4),
  pattern("PROMPT_INJECTION", "RESPOND_AS_IF", "Forza respuestas simulando acceso fuera de límites", /\bresponde?\s+como\s+si\b/i, 4),
  pattern("PROMPT_INJECTION", "NO_RESTRICTIONS", "Indica operar sin restricciones", /\bsin\s+restricciones?\b/i, 4),
  pattern("PROMPT_INJECTION", "SYSTEM_OVERRIDE_KEYWORD", "Menciones explícitas a system override", /system\s+override/i, 5),

  // Role hijacking: toma o cambio forzado de rol
  pattern("ROLE_HIJACKING", "CHANGE_ROLE", "Pide cambiar de rol explícitamente", /\bcambia\s+(a|de)\s+rol\b/i, 4),
  pattern("ROLE_HIJACKING", "ASSUME_ROLE", "Indica asumir un nuevo rol", /\basume?\s+el\s+rol\b/i, 4),
  pattern("ROLE_HIJACKING", "DEJA_DE_SER", "Solicita dejar de ser AndesGPT", /\bdej[aá]\s+de\s+ser\b/i, 4),
  pattern("ROLE_HIJACKING", "USER_OVERRIDE", "Intento de reasignar el rol de usuario/system", /\byo\s+soy\s+el\s+(nuevo\s+)?(system|usuario)\b/i, 4),

  // Instruction override: delimitadores y comandos para alterar reglas
  pattern("INSTRUCTION_OVERRIDE", "DOUBLE_DASH_DELIMITER", "Uso de -- para delimitar prompts secundarios", /(^|\s)--(\s|$)/, 3),
  pattern("INSTRUCTION_OVERRIDE", "SEMICOLON_CHAIN", "Uso de ; para encadenar instrucciones escondidas", /;/, 2),

  // Referencias internas a reglas
  pattern("INTERNAL_REFERENCE", "BASE_DE_CONOCIMIENTO", "Referencia directa a la base de conocimiento interna", /base\s+de\s+conocimiento/i, 2),
  pattern("INTERNAL_REFERENCE", "ESTE_DOCUMENTO", "Menciones explícitas al documento o reglas internas", /este\s+documento|informaci[óo]n\s+autorizada|seg[úu]n\s+el\s+archivo/i, 2),

  // Fuentes externas
  pattern(
    "EXTERNAL_SOURCE",
    "SEARCH_INTERNET",
    "Solicita buscar en internet o acceder a Google",
    /(?:busc[aá]?\s+en\s+(?:internet|google)|accede?\s+a\s+google)/i,
    3
  ),
  pattern("EXTERNAL_SOURCE", "GENERAL_KNOWLEDGE", "Pide usar conocimiento general no autorizado", /usa\s+tu\s+conocimiento\s+general/i, 3),
  pattern("EXTERNAL_SOURCE", "CONSULT_EXTERNAL", "Solicita consultar fuentes externas", /consulta\s+fuentes?\s+externas?/i, 3)
];

export interface InputGuardHeuristicConfig {
  id: string;
  type: InputGuardSignalType;
  description: string;
  score: number;
}

export const INPUT_GUARD_HEURISTICS_CONFIG = {
  STRONG_IMPERATIVE: {
    id: "HEURISTIC_STRONG_IMPERATIVE",
    type: "INSTRUCTION_OVERRIDE",
    description: "Imperativos fuertes consecutivos para forzar acciones",
    score: 2,
  keywords: ["haz", "hazlo", "ejecuta", "realiza", "ignora", "olvida", "responde", "actua", "actúa", "deja"],
    minMatches: 2
  },
  MULTI_INSTRUCTION: {
    id: "HEURISTIC_MULTI_INSTRUCTION",
    type: "INSTRUCTION_OVERRIDE",
    description: "Cadena de instrucciones iguales o superiores al umbral",
    score: 2,
    threshold: 3
  },
  EXCESSIVE_LENGTH: {
    id: "HEURISTIC_EXCESSIVE_LENGTH",
    type: "HEURISTIC",
    description: "Entrada supera el largo seguro configurado",
    score: 1,
    maxLength: 600
  },
  PATTERN_COMBO: {
    id: "HEURISTIC_MULTI_PATTERN",
    type: "INSTRUCTION_OVERRIDE",
    description: "Se detectan múltiples patrones sospechosos en un mismo input",
    score: 2,
    minPatterns: 2
  }
} as const;

export const INPUT_GUARD_RISK_THRESHOLDS = {
  MEDIUM: 4,
  HIGH: 8
} as const;
