import "./config/env.config";
import express, { Application, Request, Response } from "express";
// Express fue elegido sobre Fastify para aprovechar su API simple para SSE sin plugins adicionales.
import chatRouter from "./routes/chat.routes";

const app: Application = express();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRouter);

export default app;
