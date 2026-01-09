import { resolve } from "path";

const DEFAULT_KNOWLEDGE_FILE = "knowledge/knowledge.md";
const DEFAULT_CHUNK_SELECTION_MAX = Number(process.env.KNOWLEDGE_CHUNK_SELECTION_MAX ?? 5);
const DEFAULT_CHUNK_SELECTION_MIN_SCORE_ENV = process.env.KNOWLEDGE_CHUNK_SELECTION_MIN_SCORE;
const RAW_WATCH_ENABLED = process.env.KNOWLEDGE_WATCH_ENABLED;

const defaultWatchEnabled = (() => {
	if (process.env.NODE_ENV === "test") {
		return false;
	}
	if (process.env.NODE_ENV === "production") {
		return false;
	}
	return true;
})();

export const KNOWLEDGE_FILE_PATH = resolve(process.cwd(), process.env.KNOWLEDGE_FILE ?? DEFAULT_KNOWLEDGE_FILE);

export const KNOWLEDGE_FILE_ENCODING: BufferEncoding = "utf-8";

export const KNOWLEDGE_CHUNK_SELECTION_CONFIG = {
	maxChunks: Number.isFinite(DEFAULT_CHUNK_SELECTION_MAX) && DEFAULT_CHUNK_SELECTION_MAX > 0 ? DEFAULT_CHUNK_SELECTION_MAX : 5,
	minScore:
		DEFAULT_CHUNK_SELECTION_MIN_SCORE_ENV !== undefined
			? Number(DEFAULT_CHUNK_SELECTION_MIN_SCORE_ENV) || 0
			: undefined
};

export const KNOWLEDGE_WATCH_ENABLED = RAW_WATCH_ENABLED === "true" ? true : RAW_WATCH_ENABLED === "false" ? false : defaultWatchEnabled;

const RAW_DEBOUNCE_MS = Number(process.env.KNOWLEDGE_WATCH_DEBOUNCE_MS ?? 300);

export const KNOWLEDGE_WATCH_DEBOUNCE_MS = Number.isFinite(RAW_DEBOUNCE_MS) && RAW_DEBOUNCE_MS >= 0 ? RAW_DEBOUNCE_MS : 300;
