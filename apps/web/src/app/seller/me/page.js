"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

const empty = {
  display_name: "",
  company_name: "",
  bio: "",
  phone_public: "",
  address_public: "",
};

export default function SellerMe() {
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(""); setOk("");
    try {
      const r = await apiGet("/api/seller/me");
      setSeller(r.seller);
      setForm({
        display_name: r.seller.display_name || "",
        company_name: r.seller.company_name || "",
        bio: r.seller.bio || "",
        phone_public: r.seller.phone_public || "",
        address_public: r.seller.address_public || "",
      });
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => { load(); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/seller/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-guest-id": localStorage.getItem("souq_guest_id") || ""
        },
        body: JSON.stringify({
          display_name: form.display_name || undefined,
          company_name: form.company_name || undefined,
          bio: form.bio || undefined,
          phone_public: form.phone_public || undefined,
          address_public: form.address_public || undefined,
        })
      });

      const data = await r.json();
      if (!r.ok || data?.ok === false) throw new Error(data?.error || "SAVE_FAILED");

      setSeller(data.seller);
      setOk("تم حفظ بيانات البائع ✅");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!seller) return <div className="card"><div className="card-body">Loading...</div></div>;

  const publicId = seller.id;

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>لوحة البائع</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" href="/">← الرئيسية</Link>
          <Link className="btn btn-primary" href={`/seller/${publicId}`}>عرض الصفحة العامة</Link>
        </div>
      </div>

      {ok ? <div className="card"><div className="card-body">{ok}</div></div> : null}

      <div className="card">
        <div className="card-body">
          <div className="muted">هذه البيانات عامة وستظهر في صفحة البائع (مصدر الربح لاحقًا).</div>
          <div className="hr" />

          <label className="muted">اسم البائع (اختياري)</label>
          <input className="input" value={form.display_name} onChange={(e)=>set("display_name", e.target.value)} />

          <div style={{ height: 10 }} />
          <label className="muted">اسم الشركة (اختياري)</label>
          <input className="input" value={form.company_name} onChange={(e)=>set("company_name", e.target.value)} placeholder="اسم شركتك" />

          <div style={{ height: 10 }} />
          <label className="muted">نبذة (اختياري)</label>
          <textarea className="textarea" value={form.bio} onChange={(e)=>set("bio", e.target.value)} />

          <div style={{ height: 10 }} />
          <label className="muted">رقم تواصل عام (اختياري)</label>
          <input className="input" value={form.phone_public} onChange={(e)=>set("phone_public", e.target.value)} placeholder="+963..." />

          <div style={{ height: 10 }} />
          <label className="muted">العنوان العام (اختياري)</label>
          <input className="input" value={form.address_public} onChange={(e)=>set("address_public", e.target.value)} />

          <div style={{ height: 14 }} />
          <button className="btn btn-primary" disabled={busy} onClick={save}>
            {busy ? "..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
