import "./config/env.config";
import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
// Express fue elegido sobre Fastify para aprovechar su API simple para SSE sin plugins adicionales.
import chatRouter from "./routes/chat.routes";
import { corsConfig } from "./config/cors.config";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsConfig.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: corsConfig.allowedMethods,
  allowedHeaders: corsConfig.allowedHeaders,
  optionsSuccessStatus: 204,
  maxAge: corsConfig.maxAgeSeconds
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRouter);

export default app;
