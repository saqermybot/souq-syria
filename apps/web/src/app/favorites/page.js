"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

function FavCard({ ad, liked, onToggleFav }) {
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
        <div className="title" style={{ margin: 0 }}>{ad.title}</div>
        <div className="muted">{ad.province} • {ad.deal_type}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 900 }}>{ad.price} {ad.currency}</div>
          <div className="muted">👁 {ad.views_count}</div>
        </div>
      </div>
    </Link>
  );
}

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const [fav, ids] = await Promise.all([
        apiGet("/api/me/favorites"),
        apiGet("/api/me/favorites-ids"),
      ]);
      const list = fav.items || [];
      setItems(list);
      setFavIds(new Set((ids.ids || []).map(String)));
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
          <h1 style={{ margin: 0, fontSize: 24 }}>المفضلة</h1>
          <div className="muted">إعلاناتك المحفوظة.</div>
        </div>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      {err ? <div className="card"><div className="card-body">Error: {err}</div></div> : null}

      {items.length === 0 ? (
        <div className="card"><div className="card-body">لا توجد مفضلة بعد.</div></div>
      ) : (
        <div className="grid dense">
          {items.map((ad) => (
            <FavCard key={ad.id} ad={ad} liked={favIds.has(String(ad.id))} onToggleFav={toggleFav} />
          ))}
        </div>
      )}
    </div>
  );
}
