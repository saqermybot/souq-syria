"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotifyDebug() {
  const [info, setInfo] = useState({});
  const [msg, setMsg] = useState("");

  async function refresh() {
    const hasNotif = typeof Notification !== "undefined";
    const perm = hasNotif ? Notification.permission : "no-Notification";
    const hasSW = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;

    let swRegistered = false;
    let swScope = "";
    try {
      if (hasSW) {
        const reg = await navigator.serviceWorker.getRegistration();
        swRegistered = !!reg;
        swScope = reg?.scope || "";
      }
    } catch {}

    setInfo({
      ua: navigator.userAgent,
      hasNotification: hasNotif,
      permission: perm,
      hasServiceWorker: hasSW,
      hasPushManager: hasPush,
      swRegistered,
      swScope
    });
  }

  useEffect(() => { refresh(); }, []);

  async function askPermission() {
    setMsg("");
    try {
      if (typeof Notification === "undefined") return setMsg("Notification غير مدعوم");
      const p = await Notification.requestPermission();
      setMsg("permission = " + p);
      await refresh();
    } catch (e) {
      setMsg("خطأ: " + (e?.message || e));
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <h1 style={{ margin:0 }}>تشخيص الإشعارات</h1>
          <Link className="btn" href="/notifications">← رجوع</Link>
        </div>

        <div className="hr" />
        <pre style={{ whiteSpace:"pre-wrap", fontSize: 13 }}>
{JSON.stringify(info, null, 2)}
        </pre>

        <div className="hr" />
        <button className="btn btn-primary" onClick={askPermission}>طلب الإذن الآن</button>
        <button className="btn" onClick={refresh} style={{ marginInlineStart: 10 }}>تحديث</button>

        {msg ? <div style={{ marginTop: 12, fontWeight: 800 }}>{msg}</div> : null}
      </div>
    </div>
  );
}
