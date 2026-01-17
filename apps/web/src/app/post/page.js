"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { loadDraftText, saveDraftText } from "@/lib/draftText";

function CatCard({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        textAlign: "right",
        cursor: "pointer",
        borderColor: active ? "rgba(59,130,246,.55)" : "var(--border)",
        boxShadow: active ? "0 0 0 6px rgba(59,130,246,.10), var(--shadow)" : "var(--shadow)",
      }}
    >
      <div className="card-body">
        <div style={{ fontWeight: 900, fontSize: 16 }}>{label}</div>
        <div className="muted">اضغط للاختيار</div>
      </div>
    </button>
  );
}

export default function PostStep1() {
  const [catalog, setCatalog] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_key: "",
  });

  useEffect(() => {
    (async () => {
      const d = loadDraftText();
      setForm({
        title: d.title || "",
        description: d.description || "",
        category_key: d.category_key || "",
      });

      const c = await apiGet("/api/catalog");
      setCatalog(c);

      if (!d.category_key && c.categories?.[0]?.key) {
        setForm(prev => ({ ...prev, category_key: c.categories[0].key }));
      }
    })().catch(e => alert(e.message));
  }, []);

  const categories = catalog?.categories || [];

  const catLabelMap = useMemo(() => {
    const m = {};
    categories.forEach(c => { m[c.key] = c.label_ar || c.key; });
    return m;
  }, [categories]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function next() {
    const t = form.title.trim();
    const d = form.description.trim();
    if (t.length < 2) return alert("اكتب عنوان واضح");
    if (d.length < 2) return alert("اكتب وصف واضح");
    if (!form.category_key) return alert("اختر القسم");

    // حفظ فقط الأساسيات
    const prev = loadDraftText();
    saveDraftText({
      ...prev,
      title: t,
      description: d,
      category_key: form.category_key,
    });

    window.location.href = "/post/finish";
  }

  if (!catalog) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>إضافة إعلان</h1>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="muted">الخطوة 1/2: ماذا تبيع؟</div>
          <div className="hr" />

          <label className="muted">ماذا تبيع؟ *</label>
          <input className="input" value={form.title} onChange={(e)=>set("title", e.target.value)} />

          <div style={{ height: 10 }} />
          <label className="muted">الوصف *</label>
          <textarea className="textarea" value={form.description} onChange={(e)=>set("description", e.target.value)} />

          <div className="hr" />
          <div className="muted" style={{ marginBottom: 8 }}>اختر القسم *</div>

          <div className="grid dense">
            {categories.map(c => (
              <CatCard
                key={c.key}
                label={catLabelMap[c.key]}
                active={form.category_key === c.key}
                onClick={() => set("category_key", c.key)}
              />
            ))}
          </div>

          <div className="hr" />
          <button className="btn btn-primary" onClick={next}>التالي</button>
        </div>
      </div>
    </div>
  );
}
