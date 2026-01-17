import { Router } from "express";
import { categories, provinces, CATALOG_VERSION } from "@souq/shared";

export const catalogRouter = Router();

catalogRouter.get("/catalog", (req, res) => {
  res.json({ ok: true, version: CATALOG_VERSION, provinces, categories });
});
