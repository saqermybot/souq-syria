import { Router } from "express";
import { z } from "zod";
import { listSellers, setSellerVerified } from "./admin.service.js";

export const adminRouter = Router();

function requireAdmin(req, res) {
  const token = (req.headers["x-admin-token"] || "").toString().trim();
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    return false;
  }
  return true;
}

adminRouter.get("/admin/sellers", async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;

    const q = (req.query.q || "").toString().trim() || "";
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10) || 50, 1), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10) || 0, 0);

    const items = await listSellers({ q, limit, offset });
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/admin/sellers/:id/verify", async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;

    const sellerId = z.string().uuid().parse(req.params.id);
    const body = z.object({ is_verified: z.boolean() }).parse(req.body || {});

    const r = await setSellerVerified({ sellerId, isVerified: body.is_verified });
    if (!r.ok) return res.status(404).json({ ok: false, error: r.error });

    res.json({ ok: true, seller: r.seller });
  } catch (e) {
    // uuid parse
    if (String(e).includes("Invalid uuid")) return res.status(400).json({ ok: false, error: "BAD_ID" });
    next(e);
  }
});
