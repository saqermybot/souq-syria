"use client";

let soundEnabled = false;

export function enableSoundOnce() {
  if (soundEnabled) return;
  const handler = () => { soundEnabled = true; window.removeEventListener("pointerdown", handler); };
  window.addEventListener("pointerdown", handler, { once: true });
}

export function beep() {
  try {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.06;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 120);
  } catch {}
}

export async function notifyBrowser(title, body) {
  try {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      // ask once only when user already interacted
      await Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {}
}

export function getLastSeen(threadId) {
  try { return Number(localStorage.getItem(`souq_seen_${threadId}`) || "0"); } catch { return 0; }
}

export function setLastSeen(threadId, tsMs) {
  try { localStorage.setItem(`souq_seen_${threadId}`, String(tsMs || Date.now())); } catch {}
}
