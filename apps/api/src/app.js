import express from "express";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  // لاحقًا: routes
  return app;
}
