import { Router } from "express";
import { validateAdId } from "../ads/ads.validation.js";
import { listFavorites, toggleFavorite, listFavoriteIds } from "./favorites.service.js";

export const favoritesRouter = Router();

function getGuestId(req) {
  return (req.headers["x-guest-id"] || "").toString().trim();
}

favoritesRouter.post("/ad/:id/favorite", async (req, res, next) => {
  try {
    const v = validateAdId(req.params.id);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const r = await toggleFavorite({ adId: v.value, guestId });
    if (!r.ok) return res.status(404).json({ ok: false, error: r.error });

    return res.json({ ok: true, favorited: r.favorited });
  } catch (err) {
    return next(err);
  }
});

favoritesRouter.get("/me/favorites", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10) || 50, 1), 50);
    const offset = Math.max(parseInt(req.query.offset || "0", 10) || 0, 0);

    const items = await listFavorites({ guestId, limit, offset });
    return res.json({ ok: true, items });
  } catch (err) {
    return next(err);
  }
});

favoritesRouter.get("/me/favorites-ids", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const ids = await listFavoriteIds({ guestId });
    return res.json({ ok: true, ids });
  } catch (err) {
    return next(err);
  }
});
