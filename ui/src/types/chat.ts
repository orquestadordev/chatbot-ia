export type ChatRole = "user" | "assistant";

export type MessageStatus = "pending" | "streaming" | "complete" | "error" | "cancelled";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: MessageStatus;
  createdAt: number;
}

export interface SSEEventPayload {
  event: string;
  data: string;
}
