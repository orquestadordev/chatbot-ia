import { Request, Response } from "express";
import { ChatService, chatService } from "../services/chat.service";
import { ChatRequestBody } from "../types/chat.types";
import { isAbortError } from "../utils/error.util";
import { closeSSEStream, initSSEStream, sendSSEData, sendSSEEvent } from "../utils/sse.util";

export class ChatController {
  constructor(private readonly service: ChatService = chatService) {}

  handleChat = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as Partial<ChatRequestBody>;

    if (!payload?.message || typeof payload.message !== "string") {
      res.status(400).json({ message: "`message` field must be a non-empty string" });
      return;
    }

    const sanitizedMessage = payload.message.trim();

    if (!sanitizedMessage) {
      res.status(400).json({ message: "`message` cannot be empty" });
      return;
    }

    initSSEStream(res);

    const abortController = new AbortController();
    let streamCompleted = false;

    const handleConnectionClose = (): void => {
      if (streamCompleted) {
        return;
      }
      abortController.abort();
      closeSSEStream(res);
    };

    res.on("close", handleConnectionClose);

    try {
      await this.service.streamChat({
        message: sanitizedMessage,
        abortSignal: abortController.signal,
        onToken: async (token) => {
          sendSSEData(res, token);
        }
      });

      sendSSEEvent(res, "end", "[DONE]");
      streamCompleted = true;
      res.off("close", handleConnectionClose);
      closeSSEStream(res);
    } catch (error) {
      if (isAbortError(error)) {
        // El cliente cerró la conexión SSE: lo tratamos como un flujo cancelado sin loguear error.
        console.info("Chat streaming cancelled by client");
      } else {
        console.error("Chat streaming failed", error);
        sendSSEEvent(res, "error", "Unable to complete chat request");
      }

      streamCompleted = true;
      res.off("close", handleConnectionClose);
      closeSSEStream(res);
    }
  };
}

export const chatController = new ChatController();
