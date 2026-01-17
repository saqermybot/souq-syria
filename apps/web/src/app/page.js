"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import FilterBar from "@/components/FilterBar";

function AdCard({ ad, liked, onToggleFav, catLabel }) {
  const img = ad.images?.[0];

  return (
    <Link href={`/ad/${ad.id}`} className="card card-link">
      {img ? <img src={img} alt={ad.title} className="thumb" /> : <div className="thumb-empty">No image</div>}

      <button
        className={`fav-bubble ${liked ? "on" : ""}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(ad.id); }}
        title="Favorite"
      >
        <span className="fav-icon">{liked ? "♥" : "♡"}</span>
        <span className="fav-count">{ad.favorites_count || 0}</span>
      </button>

      <div className="card-body">
        <div className="title ellipsis" style={{ margin: 0 }}>{ad.title}</div>
        <div className="muted ellipsis">
          {(ad.seller_name || "Seller")} • {ad.province} • {catLabel}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 900 }}>{ad.price} {ad.currency}</div>
          <div className="muted">👁 {ad.views_count}</div>
        </div>
      </div>
    </Link>
  );
}

function toQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== "" && v != null) q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [catMap, setCatMap] = useState({});
  const [err, setErr] = useState("");
  const [filters, setFilters] = useState({});

  async function load(nextFilters = filters) {
    setErr("");
    try {
      const [ads, fav, catalog] = await Promise.all([
        apiGet(`/api/ads${toQuery(nextFilters)}`),
        apiGet("/api/me/favorites-ids"),
        apiGet("/api/catalog"),
      ]);

      const map = {};
      (catalog.categories || []).forEach(c => { map[c.key] = c.label_ar || c.key; });

      setItems(ads.items || []);
      setFavIds(new Set((fav.ids || []).map(String)));
      setCatMap(map);
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
          <div className="muted">فلترة اختيارية (مطابقة للـ catalog).</div>
        </div>
        <Link className="btn btn-primary" href="/post">+ إضافة إعلان</Link>
      </div>

      <FilterBar onChange={(f) => { setFilters(f); load(f); }} />

      {err ? <div className="card"><div className="card-body">Error: {err}</div></div> : null}

      <div className="grid dense">
        {items.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
            liked={favIds.has(String(ad.id))}
            onToggleFav={toggleFav}
            catLabel={catMap[ad.category_key] || ad.category_key}
          />
        ))}
      </div>
    </div>
  );
}
