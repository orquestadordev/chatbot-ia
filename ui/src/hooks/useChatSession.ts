import { useCallback, useMemo, useState } from "react";
import { ChatMessage } from "../types/chat";
import { useChatStream } from "./useChatStream";

const createMessage = (message: Partial<ChatMessage>): ChatMessage => ({
  id: crypto.randomUUID(),
  content: "",
  createdAt: Date.now(),
  role: "assistant",
  status: "pending",
  ...message
});

export const useChatSession = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const { startStream, cancelStream, isStreaming, error: streamError } = useChatStream();

  const appendToken = useCallback((messageId: string, token: string) => {
    setMessages((prev: ChatMessage[]) =>
      prev.map((msg: ChatMessage) =>
        msg.id === messageId
          ? {
              ...msg,
              content: `${msg.content}${token}`
            }
          : msg
      )
    );
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: ChatMessage["status"], fallbackContent?: string) => {
    setMessages((prev: ChatMessage[]) =>
      prev.map((msg: ChatMessage) =>
        msg.id === messageId
          ? {
              ...msg,
              status,
              content: fallbackContent ?? msg.content
            }
          : msg
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (rawMessage: string) => {
      const trimmed = rawMessage.trim();
      if (!trimmed) {
        return;
      }

      setLastError(null);

      const userMessage = createMessage({
        role: "user",
        content: trimmed,
        status: "complete"
      });

      const assistantMessage = createMessage({
        role: "assistant",
        status: "streaming"
      });

  setMessages((prev: ChatMessage[]) => [...prev, userMessage, assistantMessage]);

      try {
        await startStream(trimmed, {
          onToken: (token: string) => appendToken(assistantMessage.id, token),
          onComplete: () => updateMessageStatus(assistantMessage.id, "complete"),
          onCancelled: () => updateMessageStatus(assistantMessage.id, "cancelled"),
          onError: (message: string) => {
            setLastError(message);
            updateMessageStatus(assistantMessage.id, "error", message);
          }
        });
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
        const message = error instanceof Error ? error.message : "Unexpected error";
        setLastError(message);
        updateMessageStatus(assistantMessage.id, "error", message);
      }
    },
    [appendToken, startStream, updateMessageStatus]
  );

  const resetConversation = useCallback(() => {
    cancelStream();
    setMessages([]);
    setLastError(null);
  }, [cancelStream]);

  const status = useMemo(() => ({
    isStreaming,
    error: lastError ?? streamError ?? null
  }), [isStreaming, lastError, streamError]);

  return {
    messages,
    sendMessage,
    cancelStream,
    resetConversation,
    ...status
  };
};
