"use client";

const KEY = "souq_post_draft_v1";

export function saveDraftText(d) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(d || {}));
}

export function loadDraftText() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function clearDraftText() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
