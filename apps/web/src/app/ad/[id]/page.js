"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

function waLink(e164) {
  const digits = (e164 || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

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
    try {
      await apiPost(`/api/ad/${id}/favorite`, {});
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function del() {
    if (!confirm("حذف الإعلان؟")) return;
    try { await apiDelete(`/api/ad/${id}`); window.location.href="/"; } catch (e) { alert(e.message); }
  }

  useEffect(() => { load(); registerView(); }, [id]);

  const images = item?.images || [];
  const mainImg = images[0] || "";
  const favoritesCount = item?.favorites_count || 0;

  // NOTE: liked state per-user on details will be added after we expose ids here too.
  // For now, bubble shows count and acts as toggle; visual "on" can be added later.
  const favOn = false;

  const sellerId = item?.seller_id || "";
  const sellerLink = sellerId ? `/seller/${sellerId}` : "";
  const messageLink = sellerId ? `/messages?ad=${id}&seller=${sellerId}` : `/messages?ad=${id}`;

  const showWhatsApp = !!item?.whatsapp_e164;
  const whatsappUrl = waLink(item?.whatsapp_e164);

  if (err) return <div className="card"><div className="card-body">Error: {err}</div></div>;
  if (!item) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <Link className="btn" href="/">← رجوع</Link>
        <div style={{ display:"flex", gap:10 }}>
          <Link className="btn" href={messageLink}>💬 رسالة</Link>
          <button className="btn" onClick={del} style={{ borderColor:"rgba(255,90,90,.5)" }}>🗑 حذف</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {/* Image */}
        {mainImg ? (
          <div style={{ position:"relative" }}>
            <img src={mainImg} alt={item.title} style={{ width:"100%", maxHeight: 440, objectFit:"cover", display:"block" }} />

            {/* Favorite bubble on image (royal blue glass) */}
            <button
              className={`fav-bubble ${favOn ? "on" : ""}`}
              style={{ position:"absolute", top:12, right:12 }}
              onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); toggleFav(); }}
              title="Favorite"
            >
              <span className="fav-icon">{favOn ? "♥" : "♡"}</span>
              <span className="fav-count">{favoritesCount}</span>
            </button>

            {/* counter 1/N (simple v1) */}
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
          <h1 style={{ margin: "0 0 6px", fontSize: 26 }}>{item.title}</h1>
          <div className="muted">{item.province} • {item.deal_type}</div>

          <div className="hr" />

          {/* Price + stats */}
          <div className="row">
            <div style={{ fontWeight: 900, fontSize: 20 }}>{item.price} {item.currency}</div>
            <div className="muted">👁 {item.views_count} • ❤️ {item.favorites_count}</div>
          </div>

          <div className="hr" />

          {/* Seller snippet */}
          <div className="card" style={{ background:"rgba(255,255,255,.03)", borderColor:"rgba(255,255,255,.07)", boxShadow:"none" }}>
            <div className="card-body" style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>البائع</div>
                {sellerLink ? (
                  <Link href={sellerLink} className="muted" style={{ textDecoration:"underline" }}>
                    عرض صفحة البائع
                  </Link>
                ) : (
                  <div className="muted">—</div>
                )}
                <div className="muted" style={{ marginTop: 6 }}>
                  تاريخ الإعلان: {new Date(item.created_at).toLocaleDateString("ar")}
                </div>
              </div>

              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <Link className="btn" href={messageLink}>💬 رسالة</Link>
                {showWhatsApp ? (
                  <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                ) : null}
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

          <div className="hr" />

          {/* Seller trust panel (v1 placeholder) */}
          <div className="card" style={{ background:"rgba(255,255,255,.03)", borderColor:"rgba(255,255,255,.07)", boxShadow:"none" }}>
            <div className="card-body">
              <div style={{ fontWeight: 800, marginBottom: 8 }}>معلومات عن البائع</div>
              <div className="muted">التقييمات: قريبًا</div>
              <div className="muted">تاريخ الانضمام: قريبًا</div>
              {sellerLink ? <Link className="btn" href={sellerLink} style={{ marginTop: 10 }}>كل الإعلانات</Link> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
