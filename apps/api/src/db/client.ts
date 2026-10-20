import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { poolConfig } from "./config.js";
import { createDatabaseLifecycle } from "./lifecycle.js";

function createClient() {
  const pool = new Pool(poolConfig(process.env.DATABASE_URL));
  pool.on("error", () => {
    // Idle connection errors can include connection details. Never log the error,
    // SQL, query parameters or inquiry contents.
    console.error("Database connection unavailable");
  });
  const adapter = new PrismaPg(pool, { disposeExternalPool: true });
  return new PrismaClient({
    adapter,
    log: [],
    errorFormat: "minimal",
    transactionOptions: { maxWait: 5_000, timeout: 10_000 }
  });
}

// One lazy pool per process, also reused during development module reloads.
const globalDatabase = globalThis as typeof globalThis & {
  amplifyworldDatabase?: ReturnType<typeof createDatabaseLifecycle<PrismaClient>>;
};
const lifecycle = globalDatabase.amplifyworldDatabase ??= createDatabaseLifecycle(createClient);

// No route calls this until Module 12. /health and frontend builds need no DB.
export const getDatabase = () => lifecycle.get();
export const disconnectDatabase = () => lifecycle.close();
