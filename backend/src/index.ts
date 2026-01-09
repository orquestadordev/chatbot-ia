import "./config/env.config";
import express, { Application, Request, Response } from "express";
// Express fue elegido sobre Fastify para aprovechar su API simple para SSE sin plugins adicionales.
import { serverConfig } from "./config/server.config";
import chatRouter from "./routes/chat.routes";

const app: Application = express();
const { port } = serverConfig;

app.use(express.json());

// Health endpoint to verify API is up.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRouter);

app.listen(port, () => {
  console.info(`Chatbot backend listening on port ${port}`);
});
