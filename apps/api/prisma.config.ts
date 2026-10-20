import "dotenv/config";
import { defineConfig } from "prisma/config";

// Schema validation and client generation work without credentials. Database
// commands use scripts/database.ts, which requires and validates DIRECT_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DIRECT_URL || undefined,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined
  }
});
