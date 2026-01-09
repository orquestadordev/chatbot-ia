import { FSWatcher, watch } from "fs";
import { KnowledgeRefreshHandler, KnowledgeWatcher } from "./knowledge.watcher";

export interface FilesystemKnowledgeWatcherOptions {
  filePath: string;
  debounceMs?: number;
}

export class FilesystemKnowledgeWatcher implements KnowledgeWatcher {
  private watcher?: FSWatcher;
  private debounceTimer?: NodeJS.Timeout;

  constructor(private readonly options: FilesystemKnowledgeWatcherOptions) {}

  start(onChange: KnowledgeRefreshHandler): void {
    if (this.watcher) {
      return;
    }

    const debounceMs = this.options.debounceMs ?? 300;

    try {
      this.watcher = watch(this.options.filePath, { persistent: true }, (eventType) => {
        if (eventType !== "change" && eventType !== "rename") {
          return;
        }

        this.queueRefresh(onChange, debounceMs);
      });

      this.watcher.on("error", (error) => {
        console.warn(`[KnowledgeWatcher] Error watching ${this.options.filePath}:`, error);
      });
    } catch (error) {
      console.warn(`[KnowledgeWatcher] Unable to start watcher for ${this.options.filePath}:`, error);
    }
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    if (this.watcher) {
      try {
        this.watcher.close();
      } catch (error) {
        console.warn(`[KnowledgeWatcher] Error closing watcher for ${this.options.filePath}:`, error);
      } finally {
        this.watcher = undefined;
      }
    }
  }

  private queueRefresh(onChange: KnowledgeRefreshHandler, debounceMs: number): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined;
      try {
        onChange();
      } catch (error) {
        console.error("[KnowledgeWatcher] Error executing refresh handler:", error);
      }
    }, debounceMs);
  }
}
