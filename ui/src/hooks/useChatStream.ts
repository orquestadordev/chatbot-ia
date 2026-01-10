import { useCallback, useEffect, useRef, useState } from "react";
import { streamChatRequest } from "../services/chatClient";
import { SSEEventPayload } from "../types/chat";

const resolveDefaultEndpoint = (): string => {
  const env = import.meta.env;
  if (env.VITE_CHAT_ENDPOINT) {
    return env.VITE_CHAT_ENDPOINT;
  }
  if (env.VITE_BACKEND_URL) {
    return `${env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/chat`;
  }
  return "/api/chat";
};

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onEvent?: (payload: SSEEventPayload) => void;
  onComplete?: () => void;
  onCancelled?: () => void;
  onError?: (errorMessage: string) => void;
}

export interface UseChatStreamOptions {
  endpoint?: string;
}

export const useChatStream = (options: UseChatStreamOptions = {}) => {
  const endpoint = options.endpoint ?? resolveDefaultEndpoint();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(
    async (message: string, callbacks: StreamCallbacks = {}) => {
      if (!message.trim()) {
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsStreaming(true);
      setError(null);

      try {
        await streamChatRequest({
          endpoint,
          message,
          signal: controller.signal,
          onToken: callbacks.onToken,
          onEvent: callbacks.onEvent
        });
        callbacks.onComplete?.();
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          callbacks.onCancelled?.();
          return;
        }
        const errorMessage = error instanceof Error ? error.message : "Unexpected streaming error";
        setError(errorMessage);
        callbacks.onError?.(errorMessage);
        throw error;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [endpoint]
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    startStream,
    cancelStream,
    isStreaming,
    error
  };
};
