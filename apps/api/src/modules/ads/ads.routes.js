import { Router } from "express";
import { validateAdId, validateCreateAd, validateListAdsQuery } from "./ads.validation.js";
import { createAd, getAdById, listAds } from "./ads.service.js";

export const adsRouter = Router();

adsRouter.get("/ads", async (req, res) => {
  const v = validateListAdsQuery(req.query);
  if (!v.ok) return res.status(400).json({ ok: false, error: "BAD_QUERY" });

  const items = await listAds(v.value);
  res.json({ ok: true, items });
});

adsRouter.get("/ad/:id", async (req, res) => {
  const v = validateAdId(req.params.id);
  if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

  const item = await getAdById(v.value);
  if (!item) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

  res.json({ ok: true, item });
});

adsRouter.post("/ads", async (req, res) => {
  try {
    const v = validateCreateAd(req.body);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const id = await createAd(v.value);
    res.json({ ok: true, id: String(id) });
  } catch {
    res.status(400).json({ ok: false, error: "BAD_INPUT" });
  }
});
