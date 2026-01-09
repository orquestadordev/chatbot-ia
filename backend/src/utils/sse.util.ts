import { Response } from "express";

type FlushableResponse = Response & {
  flushHeaders?: () => void;
};

export const initSSEStream = (res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  (res as FlushableResponse).flushHeaders?.();
};

export const sendSSEData = (res: Response, data: string): void => {
  const lines = data.split(/\r?\n/);
  for (const line of lines) {
    res.write(`data: ${line}\n`);
  }
  res.write("\n");
};

export const sendSSEEvent = (res: Response, event: string, data: string): void => {
  res.write(`event: ${event}\ndata: ${data}\n\n`);
};

export const closeSSEStream = (res: Response): void => {
  if (res.writableEnded) {
    return;
  }
  res.write("event: close\ndata: stream-terminated\n\n");
  res.end();
};
