"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

export default function ThreadPage({ params }) {
  const id = params.id;
  const [data, setData] = useState(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const lastCount = useRef(0);

  async function load() {
    setErr("");
    try {
      const r = await apiGet(`/api/messages/thread/${id}`);
      setData(r);
      // toast-like simple notify (inside page)
      if (lastCount.current && r.messages?.length > lastCount.current) {
        // lightweight "toast"
        const el = document.createElement("div");
        el.textContent = "وصلت رسالة جديدة";
        el.style.position = "fixed";
        el.style.bottom = "18px";
        el.style.left = "18px";
        el.style.padding = "10px 14px";
        el.style.borderRadius = "12px";
        el.style.background = "rgba(0,0,0,.75)";
        el.style.color = "white";
        el.style.zIndex = "9999";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1800);
      }
      lastCount.current = r.messages?.length || 0;
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000); // polling
    return () => clearInterval(t);
  }, [id]);

  async function send() {
    const msg = text.trim();
    if (!msg) return;
    setText("");
    try {
      await apiPost(`/api/messages/thread/${id}/send`, { text: msg });
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!data) return <div className="card"><div className="card-body">Loading...</div></div>;

  const thread = data.thread;
  const messages = data.messages || [];

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{thread.ad_title}</div>
          <div className="muted">{thread.seller_name} {thread.seller_is_verified ? "✅" : ""}</div>
        </div>
        <Link className="btn" href="/messages">← الرجوع</Link>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.map(m => (
            <div key={m.id} style={{
              padding: "10px 12px",
              borderRadius: 14,
              background: m.sender_role === "seller" ? "rgba(59,130,246,.12)" : "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.10)"
            }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                {new Date(m.created_at).toLocaleString("ar")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <input className="input" style={{ flex: 1 }} value={text} onChange={(e)=>setText(e.target.value)} placeholder="اكتب رسالة..." />
        <button className="btn btn-primary" onClick={send}>إرسال</button>
      </div>
    </div>
  );
}
