"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

export default function MessagesInbox() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    setErr("");
    try {
      const r = await apiGet("/api/messages/inbox");
      setItems(r.items || []);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function openThread(adId, rowId) {
    setErr("");
    setBusyId(String(rowId));
    try {
      const r = await apiPost("/api/messages/open", { ad_id: Number(adId) });
      const tid = r?.thread_id;
      if (!tid) throw new Error("OPEN_THREAD_FAILED");
      window.location.href = `/messages/thread/${tid}?ts=${Date.now()}`;
    } catch (e) {
      const m = String(e.message || e);
      setErr(m);
      alert("فشل فتح المحادثة: " + m);
    } finally {
      setBusyId("");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>الرسائل</h1>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      {err ? <div className="card"><div className="card-body">Error: {err}</div></div> : null}

      <div className="card">
        <div className="card-body" style={{ display:"flex", flexDirection:"column", gap: 10 }}>
          {items.length === 0 ? (
            <div className="muted">لا توجد محادثات بعد.</div>
          ) : items.map((t) => (
            <button
              key={t.id}
              className="card"
              onClick={() => openThread(t.ad_id, t.id)}
              style={{ textAlign: "right", cursor: "pointer" }}
            >
              <div className="card-body" style={{ display:"flex", gap: 12, alignItems:"center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  overflow:"hidden",
                  border:"1px solid var(--border)",
                  background:"rgba(0,0,0,.04)",
                  flex: "0 0 auto"
                }}>
                  {t.ad_image ? (
                    <img src={t.ad_image} alt="thumb" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  ) : (
                    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }} className="muted">—</div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900 }} className="ellipsis">{t.ad_title || "إعلان"}</div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    {t.seller_name} {t.seller_is_verified ? "✅" : ""}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    آخر رسالة: {new Date(t.last_message_at).toLocaleString("ar")}
                  </div>
                </div>

                {busyId === String(t.id) ? (
                  <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>...</div>
                ) : null}
              </div>
            </button>
          ))}

          <div style={{ height: 6 }} />
          <button className="btn" onClick={load}>تحديث</button>
        </div>
      </div>
    </div>
  );
}
