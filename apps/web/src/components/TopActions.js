"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

export default function TopActions() {
  const [unread, setUnread] = useState(0);

  async function refresh() {
    try {
      const r = await apiGet("/api/messages/unread-count");
      setUnread(Number(r?.unread || 0));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 20000); // every 20s
    return () => clearInterval(t);
  }, []);

  return (
    <div className="top-actions">
      <Link className="icon-btn" title="الرسائل" style={{ position: "relative" }} href="/messages">
        💬
        {unread > 0 ? (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              minWidth: 18,
              height: 18,
              padding: "0 6px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              lineHeight: "18px",
              textAlign: "center",
              background: "rgba(239,68,68,.95)",
              color: "white",
              border: "1px solid rgba(0,0,0,.15)",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>

      <Link className="icon-btn" title="المفضلة" href="/favorites">❤️</Link>
      <Link className="icon-btn" title="الحساب" style={{ width: 56, gap: 8, justifyContent: "flex-start", padding: "0 10px" }} href="/account">
        {/* avatar + name are rendered by existing layout normally; keep simple */}
        🧑
      </Link>
    </div>
  );
}
