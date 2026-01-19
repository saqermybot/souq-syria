import { getGuestId } from "./guest";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function apiGet(path) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const r = await fetch(url, { headers: { "x-guest-id": getGuestId() } });
  const ct = r.headers.get("content-type") || "";
  const text = await r.text();
  const isJson = ct.includes("application/json");
  const data = isJson ? JSON.parse(text || "{}") : { ok: false, error: "NON_JSON", raw: text };
  if (!r.ok) throw new Error(data?.error || `HTTP_${r.status}`);
  return data;
}

export async function apiPost(path, body) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-guest-id": getGuestId(),
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || `HTTP_${r.status}`);
  return data;
}

export async function apiPostForm(path, formData) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const r = await fetch(url, {
    method: "POST",
    headers: { "x-guest-id": getGuestId() },
    body: formData,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || `HTTP_${r.status}`);
  return data;
}

export async function apiDelete(path) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const r = await fetch(url, { method: "DELETE", headers: { "x-guest-id": getGuestId() } });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || `HTTP_${r.status}`);
  return data;
}
