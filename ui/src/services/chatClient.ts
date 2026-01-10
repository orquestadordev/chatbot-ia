import { SSEEventPayload } from "../types/chat";

export interface StreamChatRequestOptions {
  endpoint: string;
  message: string;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
  onEvent?: (payload: SSEEventPayload) => void;
}

const parseSSEEvent = (rawEvent: string): SSEEventPayload => {
  const lines = rawEvent.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim() || "message";
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  return {
    event,
    data: dataLines.join("\n")
  };
};

export const streamChatRequest = async ({
  endpoint,
  message,
  signal,
  onToken,
  onEvent
}: StreamChatRequestOptions): Promise<void> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message }),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unable to read error body");
    throw new Error(`Request failed (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error("The response does not contain a readable stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processBuffer = (flushRemainder = false): boolean => {
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      if (rawEvent) {
        const event = parseSSEEvent(rawEvent);
        onEvent?.(event);

        if (event.event === "error") {
          throw new Error(event.data || "Stream error");
        }

        if (event.event === "message") {
          onToken?.(event.data);
        }

        if (event.event === "end" || event.event === "close") {
          buffer = "";
          return true;
        }
      }

      boundary = buffer.indexOf("\n\n");
    }

    if (flushRemainder && buffer.trim()) {
      const event = parseSSEEvent(buffer.trim());
      buffer = "";
      onEvent?.(event);

      if (event.event === "error") {
        throw new Error(event.data || "Stream error");
      }

      if (event.event === "message") {
        onToken?.(event.data);
      }

      if (event.event === "end" || event.event === "close") {
        return true;
      }
    }

    return false;
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        processBuffer(true);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const shouldStop = processBuffer();
      if (shouldStop) {
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
};
