import express from "express";
import { adsRouter } from "./modules/ads/ads.routes.js";
import { viewsRouter } from "./modules/views/views.routes.js";
import { favoritesRouter } from "./modules/favorites/favorites.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";
import { sellersRouter } from "./modules/sellers/sellers.routes.js";
import { catalogRouter } from "./modules/catalog/catalog.routes.js";
import { messagesRouter } from "./modules/messages/messages.routes.js";
import { pushRouter } from "./modules/push/push.routes.js";
import { pushTestRouter } from "./modules/push/push.test.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api", adsRouter);
  app.use("/api", viewsRouter);
  app.use("/api", favoritesRouter);
  app.use("/api", uploadsRouter);
  app.use("/api", sellersRouter);
  app.use("/api", catalogRouter);
  app.use("/api", messagesRouter);
  app.use("/api", pushRouter);
  app.use("/api", pushTestRouter);
  app.use("/api", pushTestRouter);
  app.use("/api", adminRouter);

  app.use((req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

  // Robust error handler (never throws)
  app.use((err, req, res, next) => {
    const msg = err?.message ? String(err.message) : "INTERNAL_ERROR";
    const code = err?.code ? String(err.code) : "";

    // Multer errors
    if (code === "LIMIT_FILE_SIZE") return res.status(400).json({ ok: false, error: "FILE_TOO_LARGE" });
    if (code === "LIMIT_FILE_COUNT") return res.status(400).json({ ok: false, error: "TOO_MANY_FILES" });

    // Upload errors
    if (msg === "BAD_IMAGE_TYPE") return res.status(400).json({ ok: false, error: "BAD_IMAGE_TYPE" });
    if (msg === "BAD_IMAGE_PROCESS") return res.status(400).json({ ok: false, error: "BAD_IMAGE_PROCESS" });

    // Validation-style messages
    if (msg.startsWith("BAD_") || msg.startsWith("MISSING_")) {
      return res.status(400).json({ ok: false, error: msg });
    }

    // Safe logging
    try {
      console.error("UNHANDLED_ERROR:", err?.stack ? err.stack : String(err));
    } catch {
      console.error("UNHANDLED_ERROR: <unprintable>");
    }

    return res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  });

  return app;
}
