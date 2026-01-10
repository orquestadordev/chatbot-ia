export const INPUT_GUARD_PATTERNS = {
  PROMPT_INJECTION: [
    /ignor[aá] tus reglas/i,
    /olvidate que sos/i,
    /dej[aá] de ser/i,
    /actu[aá] como/i,
    /respond[eé] como si/i,
    /system override/i,
    /sin restricciones/i
  ],
  ROLE_HIJACKING: [
    /cambia a rol/i,
    /asume el rol/i,
    /soy el nuevo system/i,
    /yo soy el usuario ahora/i
  ],
  EXTERNAL_SOURCES: [
    /busc[aá] en internet/i,
    /usa tu conocimiento general/i,
    /accede a google/i,
    /consulta fuentes externas/i
  ],
  SPECIAL_CHARS: [
    /--/g,
    /;/g
  ]
} as const;

export const INPUT_GUARD_HEURISTICS = {
  MAX_SAFE_LENGTH: 600,
  MULTI_INSTRUCTION_THRESHOLD: 3
} as const;
