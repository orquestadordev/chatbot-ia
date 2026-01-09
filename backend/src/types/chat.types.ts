export interface ChatRequestBody {
  message: string;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

export interface OllamaStreamChunk {
  response?: string;
  done?: boolean;
  error?: string;
}

export type TokenStreamHandler = (token: string) => Promise<void> | void;

export interface StreamChatParams {
  message: string;
  abortSignal?: AbortSignal;
  onToken: TokenStreamHandler;
}
