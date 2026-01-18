import { Router } from "express";
import { z } from "zod";
import { validateAdId } from "../ads/ads.validation.js";
import { getAdById } from "../ads/ads.service.js";
import {
  getOrCreateThread,
  listInbox,
  getThread,
  listMessages,
  sendMessage,
  unreadCount,
  markThreadRead
} from "./messages.service.js";

export const messagesRouter = Router();

function getGuestId(req) {
  return (req.headers["x-guest-id"] || "").toString().trim();
}

// Open thread by ad_id
messagesRouter.post("/messages/open", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const schema = z.object({ ad_id: z.number().int().positive() });
    const body = schema.parse(req.body || {});
    const v = validateAdId(String(body.ad_id));
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    const ad = await getAdById(v.value);
    if (!ad) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    if (!ad.seller_id) return res.status(400).json({ ok: false, error: "MISSING_SELLER" });

    const threadId = await getOrCreateThread({ adId: v.value, sellerId: ad.seller_id, buyerGuestId: guestId });
    return res.json({ ok: true, thread_id: threadId });
  } catch (e) {
    next(e);
  }
});

// Inbox
messagesRouter.get("/messages/inbox", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const items = await listInbox({ guestId });
    return res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
});

// Unread count (badge)
messagesRouter.get("/messages/unread-count", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const n = await unreadCount({ guestId });
    return res.json({ ok: true, unread: n });
  } catch (e) {
    next(e);
  }
});

// Thread + messages
messagesRouter.get("/messages/thread/:id", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const threadId = parseInt(req.params.id, 10);
    if (!Number.isInteger(threadId) || threadId <= 0) return res.status(400).json({ ok: false, error: "BAD_ID" });

    const t = await getThread({ threadId });
    if (!t) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

    const isBuyer = t.buyer_guest_id === guestId;
    const isSeller = t.seller_guest_id === guestId;
    if (!isBuyer && !isSeller) return res.status(403).json({ ok: false, error: "FORBIDDEN" });

    const msgs = await listMessages({ threadId });
    return res.json({ ok: true, thread: t, messages: msgs });
  } catch (e) {
    next(e);
  }
});

// Mark read
messagesRouter.post("/messages/thread/:id/read", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const threadId = parseInt(req.params.id, 10);
    if (!Number.isInteger(threadId) || threadId <= 0) return res.status(400).json({ ok: false, error: "BAD_ID" });

    const r = await markThreadRead({ threadId, guestId });
    if (!r.ok) return res.status(r.error === "FORBIDDEN" ? 403 : 404).json({ ok: false, error: r.error });

    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Send
messagesRouter.post("/messages/thread/:id/send", async (req, res, next) => {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ ok: false, error: "MISSING_GUEST_ID" });

    const threadId = parseInt(req.params.id, 10);
    if (!Number.isInteger(threadId) || threadId <= 0) return res.status(400).json({ ok: false, error: "BAD_ID" });

    const schema = z.object({ text: z.string().min(1).max(2000) });
    const body = schema.parse(req.body || {});

    const r = await sendMessage({ threadId, guestId, text: body.text });
    if (!r.ok) return res.status(r.error === "FORBIDDEN" ? 403 : 404).json({ ok: false, error: r.error });

    return res.json({ ok: true, message: r.message });
  } catch (e) {
    next(e);
  }
});
