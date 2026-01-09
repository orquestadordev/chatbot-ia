export interface RegressionCase {
  name: string;
  question: string;
  mustInclude: string[];
  mustExclude?: string[];
}

export const ANSWERABLE_CASES: RegressionCase[] = [
  {
    name: "Identidad del asistente",
    question: "¿Cómo se llama el chatbot local?",
    mustInclude: ["AndesGPT"]
  },
  {
    name: "Capacidades del backend",
    question: "¿Qué endpoint expone el backend para chatear?",
    mustInclude: ["/api/chat"]
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
