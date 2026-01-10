import { useEffect, useRef } from "react";
import { ChatMessage } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <p>Probá con preguntas del conocimiento autorizado para AndesGPT.</p>
        <p className="empty-hint">Ejemplo: "¿Qué es AndesGPT?"</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={endRef} />
    </div>
  );
};
