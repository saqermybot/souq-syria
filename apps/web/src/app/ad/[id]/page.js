"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function AdDetails({ params }) {
  const id = params.id;

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState(false);

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

  const images = item.images || [];
  const mainImg = images[0] || "";
  const sellerId = item.seller_id || "";
  const sellerLink = sellerId ? `/seller/${sellerId}` : "";
  const messageLink = sellerId ? `/messages?ad=${id}&seller=${sellerId}` : `/messages?ad=${id}`;

  const favCount = item.favorites_count || 0;

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <Link className="btn" href="/">← رجوع</Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" href={messageLink}>💬 رسالة</Link>
          <button className="btn" onClick={del} style={{ borderColor:"rgba(255,90,90,.5)" }}>🗑 حذف</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {/* Image */}
        {mainImg ? (
          <div style={{ position:"relative" }}>
            <img src={mainImg} alt={item.title} style={{ width:"100%", maxHeight: 420, objectFit:"cover", display:"block" }} />

            {/* Favorite bubble on image */}
            <button
              className="fav-bubble"
              style={{ position:"absolute", top:12, right:12 }}
              onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); toggleFav(); }}
              title="Favorite"
            >
              <span className="fav-icon">♡</span>
              <span className="fav-count">{favCount}</span>
            </button>

            {images.length > 1 ? (
              <div style={{
                position:"absolute", left:12, bottom:12,
                padding:"6px 10px", borderRadius:12,
                background:"rgba(0,0,0,.45)", color:"rgba(255,255,255,.92)",
                border:"1px solid rgba(255,255,255,.12)",
                fontSize:12
              }}>
                1/{images.length}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="card-body">
          {/* Title */}
          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900 }}>{item.title}</h1>
          <div className="muted" style={{ fontSize: 13 }}>{item.province} • {item.deal_type}</div>

          <div className="hr" />

          {/* Price + stats */}
          <div className="row">
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {formatPrice(item.price, item.currency)}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>👁 {item.views_count} • ❤️ {item.favorites_count}</div>
          </div>

          <div className="hr" />

          {/* Seller + actions */}
          <div className="card" style={{ background:"rgba(255,255,255,.03)", borderColor:"rgba(255,255,255,.07)", boxShadow:"none" }}>
            <div className="card-body" style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>البائع</div>
                {sellerLink ? (
                  <Link href={sellerLink} className="muted" style={{ textDecoration:"underline" }}>
                    عرض صفحة البائع
                  </Link>
                ) : <div className="muted">—</div>}
                <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                  تاريخ الإعلان: {new Date(item.created_at).toLocaleDateString("ar")}
                </div>
              </div>

              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <Link className="btn" href={messageLink}>💬 رسالة</Link>
              </div>
            </div>
          </div>

          <div className="hr" />

          {/* Description: 2 lines + read more */}
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>الوصف</div>

            <div
              style={{
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: expanded ? "unset" : 2
              }}
            >
              {item.description}
            </div>

            {item.description && item.description.length > 120 ? (
              <button className="btn" style={{ marginTop: 10 }} onClick={() => setExpanded(v => !v)}>
                {expanded ? "إخفاء" : "قراءة المزيد"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
