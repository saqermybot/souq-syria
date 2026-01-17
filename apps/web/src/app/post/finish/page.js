"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WhatsAppInput from "@/components/WhatsAppInput";
import { apiGet, apiPost, apiPostForm, apiDelete } from "@/lib/api";
import { clearDraftText, loadDraftText } from "@/lib/draftText";

export default function PostFinish() {
  const [catalog, setCatalog] = useState(null);
  const [busy, setBusy] = useState(false);

  const [draft, setDraft] = useState(null);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    subcategory_key: "",
    deal_type: "",
    car_year: "",
    car_model: "",
  });

  useEffect(() => {
    (async () => {
      const d = loadDraftText();
      if (!d.title || !d.description || !d.category_key) {
        window.location.href = "/post";
        return;
      }
      setDraft(d);

      const c = await apiGet("/api/catalog");
      setCatalog(c);

      const cat = (c.categories || []).find(x => x.key === d.category_key);
      if (!cat) { window.location.href="/post"; return; }

      setForm(f => ({
        ...f,
        subcategory_key: cat.subcategories?.[0]?.key || "",
        deal_type: cat.deal_types?.[0]?.key || "",
      }));
    })().catch(e => alert(e.message));
  }, []);

  const category = useMemo(() => {
    if (!catalog || !draft) return null;
    return (catalog.categories || []).find(c => c.key === draft.category_key) || null;
  }, [catalog, draft]);

  const subcategories = category?.subcategories || [];
  const dealTypes = category?.deal_types || [];
  const fields = category?.fields || [];

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  useEffect(() => {
    if (!category) return;
    if (subcategories.length && !subcategories.find(s => s.key === form.subcategory_key)) {
      set("subcategory_key", subcategories[0].key);
    }
    if (dealTypes.length && !dealTypes.find(d => d.key === form.deal_type)) {
      set("deal_type", dealTypes[0].key);
    }
  }, [draft?.category_key]);

  const carYearField = fields.find(f => f.key === "car_year");
  const carYearRequired =
    carYearField?.required &&
    carYearField?.required_if_subcategory_in?.includes(form.subcategory_key);

  const carYears = carYearField
    ? Array.from({ length: carYearField.max - carYearField.min + 1 }, (_, i) => carYearField.min + i)
    : [];

  async function publish() {
    if (!files.length) return alert("الصور إجباريّة: اختر على الأقل صورة واحدة");
    if (!form.subcategory_key) return alert("اختر النوع");
    if (!form.deal_type) return alert("اختر بيع/إيجار");
    if (carYearRequired && !form.car_year) return alert("سنة الصنع مطلوبة");

    setBusy(true);
    try {
      const body = {
        title: draft.title,
        description: draft.description,
        price: Number(String(draft.price).replace(/[^\d.]/g,"")),
        currency: draft.currency || "SYP",
        province: draft.province,
        category_key: draft.category_key,
        subcategory_key: form.subcategory_key,
        deal_type: form.deal_type,
        car_year: carYearRequired ? Number(form.car_year) : null,
        car_model: form.car_model || undefined,
        whatsapp_e164: draft.whatsapp_e164 || undefined,
        images: [],
      };

      const created = await apiPost("/api/ads", body);
      const id = created.id;

      const fd = new FormData();
      for (const f of files.slice(0,5)) fd.append("images", f);

      try {
        await apiPostForm(`/api/ad/${id}/images`, fd);
      } catch (e) {
        // rollback
        try { await apiDelete(`/api/ad/${id}`); } catch {}
        alert("فشل رفع الصور، لم يتم نشر الإعلان.");
        return;
      }

      clearDraftText();
      window.location.href = `/ad/${id}`;
    } finally {
      setBusy(false);
    }
  }

  if (!catalog || !draft || !category) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <h1 style={{ margin: 0 }}>إكمال الإعلان</h1>
          <div style={{ display:"flex", gap:10 }}>
            <Link className="btn" href="/post">← رجوع</Link>
            <Link className="btn" href="/">إلغاء</Link>
          </div>
        </div>

        <div className="muted">الخطوة 2/2: تفاصيل حسب القسم + صور.</div>
        <div className="hr" />

        <div className="row">
          <div style={{flex:1}}>
            <label className="muted">النوع *</label>
            <select className="select" value={form.subcategory_key} onChange={(e)=>set("subcategory_key", e.target.value)}>
              {subcategories.map(s => <option key={s.key} value={s.key}>{s.label_ar}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label className="muted">بيع/إيجار *</label>
            <select className="select" value={form.deal_type} onChange={(e)=>set("deal_type", e.target.value)}>
              {dealTypes.map(d => <option key={d.key} value={d.key}>{d.label_ar}</option>)}
            </select>
          </div>
        </div>

        {carYearField ? (
          <>
            <div className="row">
              <div style={{flex:1}}>
                <label className="muted">سنة الصنع {carYearRequired ? "*" : ""}</label>
                <select className="select" value={form.car_year} onChange={(e)=>set("car_year", e.target.value)}>
                  <option value="">اختر</option>
                  {carYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label className="muted">موديل (اختياري)</label>
                <input className="input" value={form.car_model} onChange={(e)=>set("car_model", e.target.value)} />
              </div>
            </div>
          </>
        ) : null}

        <div className="hr" />
        <label className="muted">الصور * (1 إلى 5)</label>
        <input className="input" type="file" accept="image/*" multiple onChange={(e)=>setFiles(Array.from(e.target.files||[]).slice(0,5))} />
        <div className="muted" style={{ marginTop: 6 }}>لن يتم نشر الإعلان بدون صور.</div>

        <div className="hr" />
        <button className="btn btn-primary" disabled={busy} onClick={publish}>
          {busy ? "..." : "نشر الإعلان"}
        </button>
      </div>
    </div>
  );
}
