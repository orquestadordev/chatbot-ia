export interface ParsedSSEPayload {
  data: string;
}

export const extractSSEPayload = (raw: string): ParsedSSEPayload[] => {
  return raw
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s*/, ""))
    .filter((line) => line && line !== "[DONE]" && line !== "stream-terminated")
    .map((data) => ({ data }));
};

export const concatenatePayload = (payload: ParsedSSEPayload[]): string =>
  payload.map((chunk) => chunk.data).join(" ").trim();
