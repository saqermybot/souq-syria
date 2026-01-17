"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

export default function MessagesInbox() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const r = await apiGet("/api/messages/inbox");
      setItems(r.items || []);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>الرسائل</h1>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      {err ? <div className="card"><div className="card-body">Error: {err}</div></div> : null}

      <div className="card">
        <div className="card-body">
          {items.length === 0 ? (
            <div className="muted">لا توجد محادثات بعد.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(t => (
                <Link key={t.id} className="card" href={`/messages/thread/${t.id}`} style={{ display: "block" }}>
                  <div className="card-body">
                    <div style={{ fontWeight: 900 }}>{t.ad_title}</div>
                    <div className="muted">{t.seller_name} {t.seller_is_verified ? "✅" : ""}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      آخر رسالة: {new Date(t.last_message_at).toLocaleString("ar")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
