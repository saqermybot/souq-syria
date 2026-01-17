"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

function AdCard({ ad, onToggleFav }) {
  const img = ad.images?.[0];

  return (
    <Link href={`/ad/${ad.id}`} className="card card-link">
      {img ? (
        <img src={img} alt={ad.title} className="thumb" />
      ) : (
        <div className="thumb-empty">No image</div>
      )}

      <button
        className={`heart ${ad.favorites_count > 0 ? "on" : ""}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(ad.id); }}
        title="Favorite"
      >
        <span className="icon">❤️</span>
        <span className="count">{ad.favorites_count}</span>
      </button>

      <div className="card-body">
        <div className="title" style={{ margin: 0 }}>{ad.title}</div>
        <div className="muted">{ad.province} • {ad.deal_type}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 800 }}>{ad.price} {ad.currency}</div>
          <div className="muted">👁 {ad.views_count}</div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await apiGet("/api/ads");
      setItems(data.items || []);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function toggleFav(id) {
    try {
      await apiPost(`/api/ad/${id}/favorite`, {});
      await load();
    } catch (e) {
      alert(`Favorite failed: ${e.message}`);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>آخر الإعلانات</h1>
          <div className="muted">شبكة صغيرة وسريعة.</div>
        </div>
        <Link className="btn btn-primary" href="/post">+ إضافة إعلان</Link>
      </div>

      {err ? <div className="card"><div className="card-body">Error: {err}</div></div> : null}

      <div className="grid dense">
        {items.map((ad) => <AdCard key={ad.id} ad={ad} onToggleFav={toggleFav} />)}
      </div>
    </div>
  );
}
