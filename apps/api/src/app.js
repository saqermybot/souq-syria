import express from "express";
import { adsRouter } from "./modules/ads/ads.routes.js";
import { viewsRouter } from "./modules/views/views.routes.js";
import { favoritesRouter } from "./modules/favorites/favorites.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api", adsRouter);
  app.use("/api", viewsRouter);
  app.use("/api", favoritesRouter);
  app.use("/api", uploadsRouter);

  app.use((req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

  app.use((err, req, res, next) => {
    console.error("UNHANDLED_ERROR:", err?.message || err, err);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  });

  return app;
}
