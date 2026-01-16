"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import Link from "next/link";

export default function AdDetails({ params }) {
  const id = params.id;
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await apiGet(`/api/ad/${id}`);
      setItem(data.item);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function registerView() {
    try { await apiPost(`/api/ad/${id}/view`, {}); } catch {}
  }

  async function toggleFav() {
    try { await apiPost(`/api/ad/${id}/favorite`, {}); await load(); } catch (e) { alert(e.message); }
  }

  async function del() {
    if (!confirm("حذف الإعلان؟")) return;
    try { await apiDelete(`/api/ad/${id}`); window.location.href="/"; } catch (e) { alert(e.message); }
  }

  useEffect(() => { load(); registerView(); }, [id]);

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!item) return <div className="card"><div className="card-body">Loading...</div></div>;

  const img = item.images?.[0];

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <Link className="btn" href="/">← رجوع</Link>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn" onClick={toggleFav}>❤️ مفضلة</button>
          <button className="btn" onClick={del} style={{ borderColor:"rgba(255,90,90,.5)" }}>🗑 حذف</button>
        </div>
      </div>

      <div className="card">
        {img ? <img src={img} alt={item.title} style={{ width:"100%", maxHeight: 380, objectFit:"cover" }} /> : null}
        <div className="card-body">
          <h1 style={{ margin: "0 0 8px", fontSize: 24 }}>{item.title}</h1>
          <div className="muted">{item.province} • {item.deal_type}</div>

          <div className="hr" />

          <div className="row">
            <div style={{ fontWeight: 900, fontSize: 18 }}>{item.price} {item.currency}</div>
            <div className="muted">👁 {item.views_count} • ❤️ {item.favorites_count}</div>
          </div>

          <div className="hr" />

          <div className="row" style={{ alignItems:"flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>الوصف</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{item.description}</div>
            </div>
            <div style={{ width: 260 }}>
              <div className="badge">📞 {item.phone_e164}</div>
              <div style={{ height: 10 }} />
              {item.car_year ? <div className="badge">🚗 سنة: {item.car_year}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
