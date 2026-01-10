import { type FC } from "react";
import clsx from "clsx";
import { ChatMessage } from "../types/chat";
import { formatTime } from "../utils/time";

interface MessageBubbleProps {
  message: ChatMessage;
}

const statusCopy: Record<ChatMessage["status"], string> = {
  pending: "En cola",
  streaming: "Redactando…",
  complete: "",
  error: "Error al generar",
  cancelled: "Cancelado"
};

export const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const statusLabel = statusCopy[message.status];
  const fallbackContent = message.status === "error" ? "No se pudo generar respuesta." : "…";

  const renderContent = () => {
    const rawContent = message.content?.length ? message.content : fallbackContent;
    const normalizedContent = rawContent.replace(/^\n+/, "");
    const paragraphs = normalizedContent.split(/\n{2,}/);

    return paragraphs.map((paragraph, index) => {
      const sanitized = paragraph.replace(/\r/g, "");
      const lines = sanitized.split(/\n/);
      return (
        <p key={`${message.id}-p-${index}`} className="message-content">
          {lines.map((line, lineIndex) => (
            <span key={`${message.id}-p-${index}-l-${lineIndex}`}>
              {line || "\u00A0"}
              {lineIndex < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );
    });
  };

  return (
    <div className={clsx("message-row", isUser ? "message-row--user" : "message-row--assistant")}
      aria-live={message.status === "streaming" ? "polite" : undefined}
    >
      <div className={clsx("message-avatar", isUser ? "message-avatar--user" : "message-avatar--assistant")}>
        {isUser ? "Tú" : "AG"}
      </div>
      <div className={clsx("message-bubble", isUser ? "message-bubble--user" : "message-bubble--assistant")}
        data-status={message.status}
      >
        {renderContent()}
        <div className="message-meta">
          <span>{formatTime(message.createdAt)}</span>
          {statusLabel ? <span className={clsx("message-status", `message-status--${message.status}`)}>{statusLabel}</span> : null}
        </div>
      </div>
    </div>
  );
};
