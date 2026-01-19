import crypto from "crypto";

function parseCookie(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function setGuestCookie(res, guestId) {
  res.setHeader(
    "Set-Cookie",
    `guest_id=${encodeURIComponent(guestId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
  );
}

export function guestMiddleware(req, res, next) {
  const cookies = parseCookie(req.headers.cookie || "");
  const cookieId = (cookies.guest_id || "").toString().trim();
  const headerId = (req.headers["x-guest-id"] || "").toString().trim();

  let guestId = "";

  // 1) Prefer existing cookie (stable identity)
  if (cookieId) {
    guestId = cookieId;
  }
  // 2) If no cookie but web has legacy/local guest id, adopt it and set cookie to match
  else if (headerId) {
    guestId = headerId;
    setGuestCookie(res, guestId);
  }
  // 3) Otherwise generate new
  else {
    guestId = crypto.randomBytes(16).toString("hex");
    setGuestCookie(res, guestId);
  }

  req.guest_id = guestId;

  // help any old code that still reads header/cookies
  req.headers["x-guest-id"] = guestId;
  req.cookies = req.cookies || {};
  req.cookies.guest_id = guestId;

  next();
}
