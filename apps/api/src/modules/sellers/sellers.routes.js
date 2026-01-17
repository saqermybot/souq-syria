import { Router } from "express";
import { z } from "zod";
import { getSellerById, getOrCreateSellerByGuestId, listAdsBySellerId, updateSellerMe } from "./sellers.service.js";

export const sellersRouter = Router();

function getGuestId(req) {
  return (req.headers["x-guest-id"] || "").toString().trim();
}

const uuidSchema = z.string().uuid();

const patchSchema = z.object({
  display_name: z.string().max(60).optional(),
  company_name: z.string().max(80).optional(),
  bio: z.string().max(600).optional(),
  phone_public: z.string().max(30).optional(),
  address_public: z.string().max(120).optional(),
});

sellersRouter.get("/seller/me", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const seller = await getOrCreateSellerByGuestId(guestId);
    return res.json({ ok: true, seller });
  } catch (e) {
    return next(e);
  }
});

sellersRouter.patch("/seller/me", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const patch = patchSchema.parse(req.body || {});
    await getOrCreateSellerByGuestId(guestId);

    const seller = await updateSellerMe(guestId, patch);
    return res.json({ ok: true, seller });
  } catch (e) {
    return next(e);
  }
});

sellersRouter.get("/seller/:id", async (req, res, next) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const seller = await getSellerById(id);
    if (!seller) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

    const limit = Math.min(Math.max(parseInt(req.query.limit || "30", 10) || 30, 1), 50);
    const offset = Math.max(parseInt(req.query.offset || "0", 10) || 0, 0);

    const ads = await listAdsBySellerId(id, limit, offset);
    return res.json({ ok: true, seller, ads });
  } catch (e) {
    // zod uuid parse error
    if (String(e).includes("Invalid uuid")) {
      return res.status(400).json({ ok: false, error: "BAD_ID" });
    }
    return next(e);
  }
});
