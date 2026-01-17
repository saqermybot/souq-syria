"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api";

export default function FilterBar({ open, onClose, onApply, onReset }) {
  const [catalog, setCatalog] = useState(null);

  const [f, setF] = useState({
    query: "",
    province: "",
    category_key: "",
    subcategory_key: "",
    deal_type: "",
    price_min: "",
    price_max: "",
    car_year_min: "",
    car_year_max: "",
  });

  const lastScrollY = useRef(0);

  useEffect(() => {
    apiGet("/api/catalog").then(setCatalog).catch(() => {});
  }, []);

  // auto-close on scroll down
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || 0;
      if (open && y > lastScrollY.current + 40) onClose?.();
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, onClose]);

  const categories = catalog?.categories || [];
  const provinces = catalog?.provinces || [];

  const category = useMemo(
    () => categories.find(c => c.key === f.category_key),
    [categories, f.category_key]
  );

  const subcategories = category?.subcategories || [];
  const dealTypes = category?.deal_types || [];
  const hasCarYear = useMemo(() => (category?.fields || []).some(x => x.key === "car_year"), [category]);

  function set(k, v) { setF(prev => ({ ...prev, [k]: v })); }

  useEffect(() => {
    if (!category) return;
    if (subcategories.length && !subcategories.find(s => s.key === f.subcategory_key)) set("subcategory_key", "");
    if (dealTypes.length && !dealTypes.find(d => d.key === f.deal_type)) set("deal_type", "");
    if (!hasCarYear) { set("car_year_min", ""); set("car_year_max", ""); }
  }, [f.category_key]);

  function apply() {
    const cleaned = {};
    Object.entries(f).forEach(([k, v]) => { if (v !== "" && v != null) cleaned[k] = v; });
    onApply?.(cleaned);
    onClose?.();
  }

  function reset() {
    const empty = {
      query: "",
      province: "",
      category_key: "",
      subcategory_key: "",
      deal_type: "",
      price_min: "",
      price_max: "",
      car_year_min: "",
      car_year_max: "",
    };
    setF(empty);
    onReset?.();
    onClose?.();
  }

  if (!open) return null;

  return (
    <div style={{
      position:"fixed",
      top:0, left:0, right:0,
      zIndex: 9999,
      padding: "12px",
      background: "rgba(5,10,20,.70)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,.10)"
    }}>
      <div className="card" style={{ margin:0 }}>
        <div className="card-body">
          <div className="row" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 900 }}>فلترة</div>
            <button className="btn" onClick={onClose}>إغلاق</button>
          </div>

          <div className="row" style={{ gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <div className="muted">بحث</div>
              <input className="input" value={f.query} onChange={e=>set("query", e.target.value)} placeholder="كلمة..." />
            </div>

            <div style={{ flex: "1 1 160px" }}>
              <div className="muted">المحافظة</div>
              <select className="select" value={f.province} onChange={e=>set("province", e.target.value)}>
                <option value="">الكل</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ flex: "1 1 180px" }}>
              <div className="muted">القسم</div>
              <select className="select" value={f.category_key} onChange={e=>set("category_key", e.target.value)}>
                <option value="">الكل</option>
                {categories.map(c => <option key={c.key} value={c.key}>{c.label_ar}</option>)}
              </select>
            </div>

            <div style={{ flex: "1 1 180px" }}>
              <div className="muted">النوع</div>
              <select className="select" value={f.subcategory_key} onChange={e=>set("subcategory_key", e.target.value)} disabled={!f.category_key}>
                <option value="">الكل</option>
                {subcategories.map(s => <option key={s.key} value={s.key}>{s.label_ar}</option>)}
              </select>
            </div>

            <div style={{ flex: "1 1 150px" }}>
              <div className="muted">بيع/إيجار</div>
              <select className="select" value={f.deal_type} onChange={e=>set("deal_type", e.target.value)} disabled={!f.category_key}>
                <option value="">الكل</option>
                {dealTypes.map(d => <option key={d.key} value={d.key}>{d.label_ar}</option>)}
              </select>
            </div>

            <div style={{ flex: "1 1 130px" }}>
              <div className="muted">السعر من</div>
              <input className="input" value={f.price_min} onChange={e=>set("price_min", e.target.value)} placeholder="0" />
            </div>

            <div style={{ flex: "1 1 130px" }}>
              <div className="muted">السعر إلى</div>
              <input className="input" value={f.price_max} onChange={e=>set("price_max", e.target.value)} placeholder="999" />
            </div>

            {hasCarYear ? (
              <>
                <div style={{ flex: "1 1 130px" }}>
                  <div className="muted">سنة من</div>
                  <input className="input" value={f.car_year_min} onChange={e=>set("car_year_min", e.target.value)} placeholder="2000" />
                </div>
                <div style={{ flex: "1 1 130px" }}>
                  <div className="muted">سنة إلى</div>
                  <input className="input" value={f.car_year_max} onChange={e=>set("car_year_max", e.target.value)} placeholder="2026" />
                </div>
              </>
            ) : null}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={apply}>تطبيق</button>
              <button className="btn" onClick={reset}>مسح</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
