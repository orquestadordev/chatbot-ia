import { resolve } from "path";

const DEFAULT_KNOWLEDGE_FILE = "knowledge/knowledge.md";

export const KNOWLEDGE_FILE_PATH = resolve(process.cwd(), process.env.KNOWLEDGE_FILE ?? DEFAULT_KNOWLEDGE_FILE);

export const KNOWLEDGE_FILE_ENCODING: BufferEncoding = "utf-8";
