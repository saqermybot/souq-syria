"use client";
import { useEffect, useState } from "react";
import { getGuestId, shortGuest } from "@/lib/guest";

export default function Account() {
  const [gid, setGid] = useState("");

  useEffect(() => setGid(getGuestId()), []);

  return (
    <div className="card">
      <div className="card-body">
        <h1 style={{ margin: 0 }}>الحساب</h1>
        <div className="muted">Guest الآن — لاحقًا توثيق برقم الهاتف.</div>

        <div className="hr" />

        <div className="badge">👤 {gid ? shortGuest(gid) : "Guest"}</div>
        <div style={{ height: 10 }} />
        <div className="muted">Guest ID: {gid || "-"}</div>

        <div className="hr" />

        <div style={{ fontWeight: 800, marginBottom: 8 }}>توثيق الحساب (قريبًا)</div>
        <div className="muted">سيتم إضافة OTP للهاتف لاحقًا وفق SPEC.</div>

        <div style={{ height: 12 }} />
        <button className="btn" disabled title="Coming soon">
          📱 توثيق الهاتف (قريبًا)
        </button>
      </div>
    </div>
  );
}
