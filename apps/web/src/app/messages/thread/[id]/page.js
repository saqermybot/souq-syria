"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { getGuestId } from "@/lib/guest";

function isReadByOther(m, thread, myGuest) {
  if (!thread) return false;
  const ts = Date.parse(m.created_at) || 0;

  const buyerRead = Date.parse(thread.buyer_last_read_at || "") || 0;
  const sellerRead = Date.parse(thread.seller_last_read_at || "") || 0;

  const iAmSeller = thread.seller_guest_id === myGuest;
  const iAmBuyer = thread.buyer_guest_id === myGuest;

  // If I sent message as seller -> read when buyer read time >= message time
  if (iAmSeller && m.sender_role === "seller") return buyerRead >= ts;
  // If I sent message as buyer -> read when seller read time >= message time
  if (iAmBuyer && m.sender_role === "buyer") return sellerRead >= ts;

  return false;
}

export default function ThreadPage({ params }) {
  const threadId = params?.id;

  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const listRef = useRef(null);
  const myGuest = useRef("");

  useEffect(() => {
    try { myGuest.current = getGuestId(); } catch { myGuest.current = ""; }
  }, []);

  function scrollToBottom() {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  async function load({ silent=false } = {}) {
    if (!silent) setErr("");
    try {
      if (!threadId) throw new Error("BAD_ID");
      const r = await apiGet(`/api/messages/thread/${threadId}`);
      setThread(r.thread);
      setMessages(r.messages || []);

      // mark read
      try { await apiPost(`/api/messages/thread/${threadId}/read`, {}); } catch {}
      setTimeout(scrollToBottom, 80);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(() => load({ silent: true }), 3500);
    return () => clearInterval(t);
  }, [threadId]);

  async function send() {
    const msg = text.trim();
    if (!msg) return;
    setText("");
    try {
      await apiPost(`/api/messages/thread/${threadId}/send`, { text: msg });
      await load({ silent: true });
    } catch (e) {
      alert(e.message);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;
  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;

  return (
    <div style={{ paddingBottom: 72 }}>
      <div className="row" style={{ marginBottom: 10, alignItems: "center" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
          {thread?.ad_image ? (
            <img src={thread.ad_image} alt="thumb" width="36" height="36" style={{ borderRadius: 10, objectFit:"cover", border:"1px solid var(--border)" }} />
          ) : null}
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{thread?.ad_title || "محادثة"}</div>
            <div className="muted" style={{ fontSize: 12 }}>{thread?.seller_name || "Seller"} {thread?.seller_is_verified ? "✅" : ""}</div>
          </div>
        </div>

        <button className="btn" onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href="/messages"))} style={{ marginInlineStart: 0, marginInlineEnd: "auto" }}>
          ← الرجوع
        </button>
      </div>

      <div ref={listRef} className="card" style={{ height: "62vh", overflowY: "auto" }}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 90 }}>
          {messages.map(m => {
            const mine = myGuest.current && m.sender_guest_id === myGuest.current;
            const read = mine ? isReadByOther(m, thread, myGuest.current) : false;

            return (
              <div key={m.id} style={{ maxWidth: "85%", marginInlineStart: mine ? "auto" : 0, marginInlineEnd: mine ? 0 : "auto", textAlign: "right" }}>
                <div style={{
                  padding: "8px 12px",
                  borderRadius: 14,
                  background: mine ? "var(--chat-mine)" : "var(--chat-other)",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 6 }}>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {new Date(m.created_at).toLocaleTimeString("ar")}
                    </div>

                    {mine ? (
                      <div style={{ fontSize: 14, fontWeight: 900, color: read ? "rgba(37,99,235,.95)" : "rgba(100,116,139,.9)" }}>
                        {read ? "✓✓" : "✓"}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 ? <div className="muted">لا توجد رسائل بعد.</div> : null}
        </div>
      </div>

      <div style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "8px 10px",
        background: "var(--card)",
        borderTop: "1px solid var(--border)"
      }}>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={send} style={{ minWidth: 80, height: 40 }}>
            إرسال
          </button>
          <input className="input" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={onKeyDown} placeholder="اكتب رسالة..." style={{ flex: 1, height: 40 }} />
        </div>
      </div>
    </div>
  );
}
