"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import FilterBar from "@/components/FilterBar";
import AdCard from "@/components/AdCard";

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
          <div className="muted">واجهة مرتّبة ومريحة.</div>
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
