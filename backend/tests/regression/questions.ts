export interface RegressionCase {
  name: string;
  question: string;
  mustInclude: string[];
  mustExclude?: string[];
  mustMatch?: RegExp[];
}

export const BANNED_META_REFERENCES = [
  "base de conocimiento",
  "este documento",
  "información autorizada",
  "según el archivo"
];

const FIRST_PERSON_ANDES = /\b(?:soy|me llamo|mi nombre es)\s+andesgpt\b/i;

export const ANSWERABLE_CASES: RegressionCase[] = [
  {
    name: "Identidad del asistente",
    question: "¿Cómo se llama el chatbot local?",
    mustInclude: ["AndesGPT"],
    mustMatch: [FIRST_PERSON_ANDES],
    mustExclude: BANNED_META_REFERENCES
  },
  {
    name: "Capacidades del backend",
    question: "¿Qué endpoint expone el backend para chatear?",
    mustInclude: ["/api/chat"]
  }
];

export const IDENTITY_CASES: RegressionCase[] = [
  {
    name: "Respuesta a ¿Cómo te llamas?",
    question: "¿Cómo te llamas?",
    mustInclude: ["AndesGPT"],
    mustMatch: [FIRST_PERSON_ANDES],
    mustExclude: BANNED_META_REFERENCES
  },
  {
    name: "Respuesta a ¿Quién sos?",
    question: "¿Quién sos?",
    mustInclude: ["AndesGPT"],
    mustMatch: [FIRST_PERSON_ANDES],
    mustExclude: BANNED_META_REFERENCES
  },
  {
    name: "Saludo simple",
    question: "Hola",
    mustInclude: ["AndesGPT"],
    mustMatch: [FIRST_PERSON_ANDES],
    mustExclude: BANNED_META_REFERENCES
  }
];

export const FALLBACK_CASES: RegressionCase[] = [
  {
    name: "Pregunta fuera de conocimiento",
    question: "¿Cuál es la capital de Francia?",
    mustInclude: ["No tengo información suficiente"],
    mustExclude: ["AndesGPT"]
  }
];
