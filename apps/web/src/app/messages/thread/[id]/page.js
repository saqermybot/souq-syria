"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { getGuestId } from "@/lib/guest";

function Toast({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 18,
      left: 18,
      padding: "10px 14px",
      borderRadius: 12,
      background: "rgba(0,0,0,.75)",
      color: "white",
      zIndex: 9999,
      border: "1px solid rgba(255,255,255,.15)",
      fontSize: 13
    }}>
      {text}
    </div>
  );
}

export default function ThreadPage({ params }) {
  const threadId = params.id;

  const [data, setData] = useState(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const lastCount = useRef(0);
  const listRef = useRef(null);
  const myGuestId = useMemo(() => {
    try { return getGuestId(); } catch { return ""; }
  }, []);

  function scrollToBottom(instant = false) {
    const el = listRef.current;
    if (!el) return;
    if (instant) el.scrollTop = el.scrollHeight;
    else el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  async function load({ silent = false } = {}) {
    if (!silent) setErr("");
    try {
      const r = await apiGet(`/api/messages/thread/${threadId}`);
      setData(r);

      const newLen = r.messages?.length || 0;
      if (lastCount.current && newLen > lastCount.current) {
        setToast("وصلت رسالة جديدة");
        setTimeout(() => setToast(""), 1500);
        scrollToBottom(false);
      } else if (!lastCount.current && newLen) {
        // first load
        setTimeout(() => scrollToBottom(true), 50);
      }
      lastCount.current = newLen;
    } catch (e) {
      setErr(String(e.message || e));
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
      setTimeout(() => scrollToBottom(false), 80);
    } catch (e) {
      alert(e.message);
    }
  }

  function onKeyDown(e) {
    // Enter to send (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!data) return <div className="card"><div className="card-body">Loading...</div></div>;

  const thread = data.thread;
  const messages = data.messages || [];
  const sellerName = thread?.seller_name || "Seller";
  const verified = thread?.seller_is_verified ? "✅" : "";

  return (
    <div style={{ paddingBottom: 88 }}>
      <Toast text={toast} />

      {/* Header */}
      <div className="row" style={{ marginBottom: 12, alignItems: "center" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>{thread.ad_title}</div>
          <div className="muted">{sellerName} {verified}</div>
        </div>

        {/* Back on LEFT for Arabic thumb reach */}
        <Link className="btn" href="/messages" style={{ marginInlineStart: 0, marginInlineEnd: "auto" }}>
          ← الرجوع
        </Link>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="card"
        style={{
          height: "62vh",
          overflowY: "auto",
        }}
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m) => {
            const mine = myGuestId && m.sender_guest_id === myGuestId;
            return (
              <div
                key={m.id}
                style={{
                  maxWidth: "92%",
                  alignSelf: mine ? "flex-start" : "flex-end",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: mine ? "rgba(59,130,246,.14)" : "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.10)",
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{m.text}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                    {new Date(m.created_at).toLocaleString("ar")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer fixed bottom */}
      <div style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "12px",
        background: "rgba(5,10,20,.70)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,.10)",
      }}>
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          {/* Send button on LEFT */}
          <button className="btn btn-primary" onClick={send} style={{ minWidth: 92 }}>
            إرسال
          </button>

          <textarea
            className="textarea"
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="اكتب رسالة..."
            style={{ flex: 1, height: 44, paddingTop: 10, resize: "none" }}
          />
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          Enter للإرسال • Shift+Enter لسطر جديد
        </div>
      </div>
    </div>
  );
}
