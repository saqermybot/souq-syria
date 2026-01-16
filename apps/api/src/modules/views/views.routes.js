import { Router } from "express";
import { validateAdId } from "../ads/ads.validation.js";
import { registerView } from "./views.service.js";

export const viewsRouter = Router();

viewsRouter.post("/ad/:id/view", async (req, res, next) => {
  try {
    const v = validateAdId(req.params.id);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const guestId = (req.headers["x-guest-id"] || "").toString().trim();
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const r = await registerView({ adId: v.value, guestId });
    if (!r.ok) return res.status(404).json({ ok: false, error: r.error });

    return res.json({ ok: true, counted: r.counted });
  } catch (err) {
    return next(err);
  }
});
