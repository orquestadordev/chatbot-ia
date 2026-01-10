import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { config as loadEnvFile } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const backendEnvPath = resolve(currentDir, "../backend/.env");

if (existsSync(backendEnvPath)) {
  loadEnvFile({ path: backendEnvPath, override: false });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT ?? 5173),
      host: true,
      proxy: env.VITE_BACKEND_URL
        ? {
            "/api": {
              target: env.VITE_BACKEND_URL,
              changeOrigin: true
            }
          }
        : undefined
    }
  };
});
