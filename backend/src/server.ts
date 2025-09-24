import http from "http";
import { createApp } from "./app";
import { initSocket } from "./services/socket";
import { config } from "./config/env";

const bootstrap = async () => {
  const app = await createApp();

  const server = http.createServer(app);

  initSocket(server, config.corsOrigin);

  server.listen(config.port, () => {
    console.log(`API running at http://localhost:${config.port}`);
  });
};

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
