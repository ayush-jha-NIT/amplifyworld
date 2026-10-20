import cors from "cors";
import express from "express";
import type { HealthResponse } from "@amplifyworld/shared";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_request, response) => {
    const payload: HealthResponse = { service: "amplifyworld-api", status: "ok" };
    response.status(200).json(payload);
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });

  return app;
}
