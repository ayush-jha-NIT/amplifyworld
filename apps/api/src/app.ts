import cors from "cors";
import express from "express";
import type { ErrorRequestHandler } from "express";
import type { HealthResponse } from "@amplifyworld/shared";
import { createPublicRouter } from "./routes/public.js";

export function createApp(options: Parameters<typeof createPublicRouter>[0] = {}) {
  const app = express();
  app.disable("x-powered-by");
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  if (Number.isInteger(proxyHops) && proxyHops >= 1 && proxyHops <= 2) {
    app.set("trust proxy", proxyHops);
  }

  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",").map((value) => value.trim()).filter(Boolean);
  app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST", "OPTIONS"] }));
  app.use(express.json({ limit: "20kb", strict: true }));

  app.get("/health", (_request, response) => {
    const payload: HealthResponse = { service: "amplifyworld-api", status: "ok" };
    response.status(200).json(payload);
  });
  app.use("/api/v1", createPublicRouter(options));

  const handleError: ErrorRequestHandler = (err: unknown, _request, response, _next) => {
    const info = err as { status?: number; type?: string };
    const tooLarge = info?.status === 413;
    response.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? "PAYLOAD_TOO_LARGE" : "INVALID_JSON",
        message: tooLarge ? "Request is too large." : "Invalid JSON request."
      }
    });
  };
  app.use(handleError);
  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });
  return app;
}
