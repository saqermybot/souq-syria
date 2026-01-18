"use client";
import { useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

export default function NotificationsPage() {
  const [msg, setMsg] = useState("");
  const [dbg, setDbg] = useState("");

  async function enable() {
    setMsg("");
    setDbg("");

    try {
      if (typeof Notification === "undefined") {
        setMsg("Notification غير مدعوم");
        return;
      }

      const perm = await Notification.requestPermission();
      setDbg((x) => x + `permission=${perm}\n`);
      if (perm !== "granted") {
        setMsg("تم رفض الإذن");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setMsg("Service Worker غير مدعوم");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      setDbg((x) => x + `swReady=true scope=${reg.scope}\n`);

      const k = await apiGet("/api/push/vapid-public-key");
      const publicKey = k.publicKey || "";
      setDbg((x) => x + `publicKeyLen=${publicKey.length}\n`);
      if (!publicKey) {
        setMsg("VAPID غير جاهز على السيرفر");
        return;
      }

      // subscribe
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        setDbg((x) => x + `subscribed=new\n`);
      } else {
        setDbg((x) => x + `subscribed=existing\n`);
      }

      // send to server
      const r = await apiPost("/api/push/subscribe", sub);
      setDbg((x) => x + `serverReply=${JSON.stringify(r)}\n`);

      setMsg("تم تفعيل إشعارات الرسائل ✅");
    } catch (e) {
      setMsg("فشل التفعيل");
      setDbg((x) => x + `ERROR=${String(e?.message || e)}\n`);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <h1 style={{ margin:0 }}>الإشعارات</h1>
          <Link className="btn" href="/messages">← الرجوع</Link>
        </div>

        <div className="muted" style={{ marginTop:10 }}>
          ملاحظة: المتصفح لا يسمح بطلب الإذن تلقائيًا — لازم تضغط زر التفعيل مرة واحدة.
        </div>

        <div className="hr" />
        <button className="btn btn-primary" onClick={enable}>تفعيل إشعارات الرسائل</button>

        {msg ? <div style={{ marginTop:12, fontWeight: 900 }}>{msg}</div> : null}

        {dbg ? (
          <pre style={{ marginTop: 12, fontSize: 12, whiteSpace:"pre-wrap", background:"rgba(0,0,0,.04)", padding:10, borderRadius:12 }}>
{dbg}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
