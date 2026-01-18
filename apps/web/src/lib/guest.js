export function getGuestId() {
  if (typeof window === "undefined") return "";
  const key = "souq_guest_id";
  let v = localStorage.getItem(key);
  if (!v) {
    // simple uuid-ish
    v = crypto.randomUUID
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, v);
  }
  return v;
}

export function shortGuest(guestId) {
  if (!guestId) return "Guest";
  const tail = guestId.replace(/-/g, "").slice(-4).toUpperCase();
  return `Guest-${tail}`;
}

