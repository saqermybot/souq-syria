"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

export default function SellerMe() {
  const [seller, setSeller] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const r = await apiGet("/api/seller/me");
        setSeller(r.seller);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, []);

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!seller) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>صفحة البائع</h1>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="muted">هذه صفحة إدارة بسيطة (التعديل الكامل لاحقًا).</div>
          <div className="hr" />
          <div className="badge">ID: {seller.id}</div>
          <div style={{ height: 10 }} />
          <div className="badge">Verified: {seller.is_verified ? "Yes" : "No"}</div>
          <div style={{ height: 14 }} />
          <Link className="btn btn-primary" href={`/seller/${seller.id}`}>عرض الصفحة العامة</Link>
        </div>
      </div>
    </div>
  );
}
