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
        <p className="message-content">{message.content || (message.status === "error" ? "No se pudo generar respuesta." : "…")}</p>
        <div className="message-meta">
          <span>{formatTime(message.createdAt)}</span>
          {statusLabel ? <span className={clsx("message-status", `message-status--${message.status}`)}>{statusLabel}</span> : null}
        </div>
      </div>
    </div>
  );
};
