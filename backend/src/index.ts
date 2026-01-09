import app from "./app";
import { serverConfig } from "./config/server.config";

const { port } = serverConfig;

app.listen(port, () => {
  console.info(`Chatbot backend listening on port ${port}`);
});
