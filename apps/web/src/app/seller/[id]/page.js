"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

function AdCard({ ad }) {
  const img = ad.images?.[0];
  return (
    <Link href={`/ad/${ad.id}`} className="card" style={{ display: "block" }}>
      {img ? (
        <img src={img} alt={ad.title} style={{ width: "100%", height: 190, objectFit: "cover" }} />
      ) : (
        <div style={{ height: 190, background: "rgba(255,255,255,.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
          No image
        </div>
      )}
      <div className="card-body">
        <div className="title" style={{ margin: 0 }}>{ad.title}</div>
        <div className="muted">{ad.province} • {ad.deal_type}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 800 }}>{ad.price} {ad.currency}</div>
          <div className="muted">👁 {ad.views_count} • ❤️ {ad.favorites_count}</div>
        </div>
      </div>
    </Link>
  );
}

export default function SellerPublic({ params }) {
  const id = params.id;
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const r = await apiGet(`/api/seller/${id}`);
        setData(r);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [id]);

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!data) return <div className="card"><div className="card-body">Loading...</div></div>;

  const seller = data.seller;
  const ads = data.ads || [];

  const name = seller.company_name || seller.display_name || "Seller";
  const badge = seller.is_verified ? "✅ موثق" : "👤 بائع";

  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>{name}</h1>
          <div className="muted">{badge} • عدد الإعلانات: {ads.length}</div>
        </div>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      {seller.bio ? <div className="card"><div className="card-body">{seller.bio}</div></div> : null}

      <div className="hr" />

      <div className="grid">
        {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
      </div>
    </div>
  );
}
