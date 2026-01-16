import express from "express";
import { adsRouter } from "./modules/ads/ads.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api", adsRouter);

  app.use((req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

  return app;
}
