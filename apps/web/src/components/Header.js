"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getGuestId, shortGuest } from "@/lib/guest";

export default function Header() {
  const [guest, setGuest] = useState("");
  const name = process.env.NEXT_PUBLIC_SITE_NAME || "Souq Syria";

  useEffect(() => {
    setGuest(getGuestId());
  }, []);

  return (
    <div className="header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--accent)", boxShadow: "0 0 0 4px rgba(74,163,255,.18)" }} />
          <span>{name}</span>
        </Link>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link className="icon-btn" href="/messages" title="Messages">💬</Link>
          <Link className="icon-btn" href="/favorites" title="Favorites">❤️</Link>
          <Link className="pill" href="/account" title="Account">
            <span>👤</span>
            <span>{guest ? shortGuest(guest) : "Guest"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
