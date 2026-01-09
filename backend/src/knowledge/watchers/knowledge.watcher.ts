export type KnowledgeRefreshHandler = () => void;

export interface KnowledgeWatcher {
  start(onChange: KnowledgeRefreshHandler): void;
  stop(): void;
}
