"use client";
import Link from "next/link";
import { formatPrice, clampOneLine } from "@/lib/format";

function dealLabel(key) {
  if (key === "sale") return "بيع";
  if (key === "rent") return "إيجار";
  if (key === "wanted") return "طلب";
  if (key === "offer") return "عرض";
  return key || "";
}

export default function AdCard({ ad, liked, onToggleFav, catLabel }) {
  const img = ad.images?.[0];
  const deal = dealLabel(ad.deal_type);

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
        <div className="title ellipsis" style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>
          {clampOneLine(ad.title, 44)}
        </div>

        <div className="muted ellipsis" style={{ fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{(ad.seller_name || "Seller")} • {ad.province} • {catLabel}</span>
          {deal ? <span className="deal-badge">{deal}</span> : null}
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>
            {formatPrice(ad.price, ad.currency)}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>👁 {ad.views_count}</div>
        </div>
      </div>
    </Link>
  );
}
