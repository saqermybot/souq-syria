import { Router } from "express";
import { sendPushToGuest, isPushReady } from "./push.service.js";

export const pushTestRouter = Router();

function getGuestId(req) {
  return (req.headers["x-guest-id"] || "").toString().trim();
}

pushTestRouter.post("/push/test", async (req, res) => {
  const guestId = getGuestId(req);
  if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });
  if (!isPushReady()) return res.status(400).json({ ok: false, error: "PUSH_NOT_READY" });

  await sendPushToGuest({
    guestId,
    payload: { title: "Souq Syria", body: "اختبار إشعار ✅", url: "/messages" }
  });

  res.json({ ok: true });
});
