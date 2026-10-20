import "dotenv/config";
import { createApp } from "./app.js";
import { disconnectDatabase } from "./db/client.js";

const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port between 1 and 65535");
}

const app = createApp();
const server = app.listen(port, () => {
  console.info(`AmplifyWorld API listening on port ${port}`);
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const deadline = setTimeout(() => {
    console.error("API shutdown timed out");
    process.exit(1);
  }, 15_000);
  deadline.unref();
  server.close(async (error) => {
    try {
      await disconnectDatabase();
      process.exitCode = error ? 1 : 0;
    } catch {
      console.error("Database shutdown failed");
      process.exitCode = 1;
    } finally {
      clearTimeout(deadline);
    }
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
