import { Router } from "express";
import { z } from "zod";
import { getVapidPublicKey, upsertSubscription, deleteSubscription } from "./push.service.js";

export const pushRouter = Router();

function getGuestId(req) {
  return (req.headers["x-guest-id"] || "").toString().trim();
}

pushRouter.get("/push/vapid-public-key", (req, res) => {
  res.json({ ok: true, publicKey: getVapidPublicKey() });
});

pushRouter.post("/push/subscribe", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const schema = z.object({
      endpoint: z.string().url(),
      keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
      }),
    });

    const body = schema.parse(req.body || {});
    const ua = (req.headers["user-agent"] || "").toString();

    await upsertSubscription({
      guestId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: ua
    });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

pushRouter.post("/push/unsubscribe", async (req, res, next) => {
  try {
    const schema = z.object({ endpoint: z.string().min(1) });
    const body = schema.parse(req.body || {});
    await deleteSubscription({ endpoint: body.endpoint });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
