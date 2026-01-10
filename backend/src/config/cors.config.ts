const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const parseOrigins = (rawValue?: string): string[] => {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOriginsFromEnv = parseOrigins(process.env.CORS_ALLOWED_ORIGINS);

export const corsConfig = {
  allowedOrigins: allowedOriginsFromEnv.length > 0 ? allowedOriginsFromEnv : DEFAULT_ALLOWED_ORIGINS,
  allowedMethods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAgeSeconds: 60 * 60 * 8 // 8 horas para cachear la preflight
};
