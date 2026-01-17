"use client";

const KEY = "souq_post_draft_v1";
const E164 = /^\+[1-9]\d{6,14}$/;

export function saveDraftText(d) {
  if (typeof window === "undefined") return;
  const clean = { ...(d || {}) };
  if (clean.whatsapp_e164 && !E164.test(clean.whatsapp_e164)) delete clean.whatsapp_e164;
  localStorage.setItem(KEY, JSON.stringify(clean));
}

export function loadDraftText() {
  if (typeof window === "undefined") return {};
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (d.whatsapp_e164 && !E164.test(d.whatsapp_e164)) {
      delete d.whatsapp_e164;
      localStorage.setItem(KEY, JSON.stringify(d));
    }
    return d;
  } catch {
    return {};
  }
}

export function clearDraftText() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
