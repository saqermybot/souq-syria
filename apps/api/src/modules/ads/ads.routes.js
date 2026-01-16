import { Router } from "express";
import { validateAdId, validateCreateAd, validateListAdsQuery } from "./ads.validation.js";
import { createAd, deleteAd, getAdById, listAds } from "./ads.service.js";

export const adsRouter = Router();

function getGuestId(req) {
  return (req.headers["x-guest-id"] || "").toString().trim();
}

function isAdmin(req) {
  const t = (req.headers["x-admin-token"] || "").toString().trim();
  return !!process.env.ADMIN_TOKEN && t && t === process.env.ADMIN_TOKEN;
}

adsRouter.get("/ads", async (req, res, next) => {
  try {
    const v = validateListAdsQuery(req.query);
    if (!v.ok) return res.status(400).json({ ok: false, error: "BAD_QUERY" });
    const items = await listAds(v.value);
    return res.json({ ok: true, items });
  } catch (err) {
    return next(err);
  }
});

adsRouter.get("/ad/:id", async (req, res, next) => {
  try {
    const v = validateAdId(req.params.id);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const item = await getAdById(v.value);
    if (!item) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

    return res.json({ ok: true, item });
  } catch (err) {
    return next(err);
  }
});

// إنشاء إعلان: يتطلب x-guest-id
adsRouter.post("/ads", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const v = validateCreateAd(req.body);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const id = await createAd(v.value, guestId);
    return res.json({ ok: true, id: String(id) });
  } catch (err) {
    return next(err);
  }
});

// حذف إعلان: البائع أو الأدمن
adsRouter.delete("/ad/:id", async (req, res, next) => {
  try {
    const v = validateAdId(req.params.id);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const guestId = getGuestId(req);
    const admin = isAdmin(req);

    if (!admin && !guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const r = await deleteAd({ adId: v.value, guestId, admin });
    if (!r.ok) return res.status(400).json({ ok: false, error: r.error });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
