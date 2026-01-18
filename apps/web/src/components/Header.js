"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function Header({ guest }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function poll() {
      try {
        const r = await apiGet("/api/messages/unread-count");
        setUnread(r.unread || 0);
      } catch {
        // ignore
      }
    }
    poll();
    const t = setInterval(poll, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="topbar">
      <Link href="/" className="brand">Souq Syria</Link>

      <div className="top-actions">
        <Link href="/messages" className="icon-btn" title="الرسائل" style={{ position:"relative" }}>
          💬
          {unread > 0 ? (
            <span style={{
              position:"absolute",
              top:-6, right:-6,
              minWidth:18,
              height:18,
              padding:"0 6px",
              borderRadius:999,
              background:"rgba(239,68,68,.95)",
              color:"white",
              fontSize:11,
              fontWeight:900,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              border:"2px solid rgba(255,255,255,.9)"
            }}>
              {unread}
            </span>
          ) : null}
        </Link>

        <Link href="/favorites" className="icon-btn" title="المفضلة">❤️</Link>

        <Link href="/account" className="icon-btn" title="الحساب" style={{ width: 56, gap: 8, justifyContent:"flex-start", padding:"0 10px" }}>
          <img src="/icons/syria-flag-round.png" alt="avatar" width="28" height="28" style={{ borderRadius: 999, display:"block" }} />
          <span style={{ fontSize: 14, fontWeight: 800 }}>{guest || "Guest"}</span>
        </Link>
      </div>
    </div>
  );
}
