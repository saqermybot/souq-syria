"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WhatsAppInput from "@/components/WhatsAppInput";
import { apiGet, apiPost, apiPostForm, apiDelete } from "@/lib/api";
import { clearDraft, getDraftImages, getDraftTitle } from "@/lib/draftStore";

export default function PostStepDetails() {
  const [catalog, setCatalog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [whatsappE164, setWhatsappE164] = useState(undefined);

  const [form, setForm] = useState({
    description: "",
    category_key: "",
    subcategory_key: "",
    deal_type: "",
    province: "",
    price: "",
    currency: "SYP",
    car_year: "",
    car_model: "",
  });

  useEffect(() => {
    apiGet("/api/catalog").then(setCatalog).catch(e => alert(e.message));
  }, []);

  const categories = catalog?.categories || [];
  const provinces = catalog?.provinces || [];

  const category = useMemo(
    () => categories.find(c => c.key === form.category_key),
    [categories, form.category_key]
  );

  const subcategories = category?.subcategories || [];
  const dealTypes = category?.deal_types || [];
  const fields = category?.fields || [];

  useEffect(() => {
    if (!catalog) return;
    if (!form.category_key && categories[0]) {
      setForm(f => ({ ...f, category_key: categories[0].key }));
    }
  }, [catalog]);

  useEffect(() => {
    if (subcategories.length && !subcategories.find(s => s.key === form.subcategory_key)) {
      setForm(f => ({ ...f, subcategory_key: subcategories[0].key }));
    }
  }, [form.category_key, subcategories]);

  useEffect(() => {
    if (dealTypes.length && !dealTypes.find(d => d.key === form.deal_type)) {
      setForm(f => ({ ...f, deal_type: dealTypes[0].key }));
    }
  }, [form.category_key, dealTypes]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const carYearField = fields.find(f => f.key === "car_year");
  const carYearRequired =
    carYearField?.required &&
    carYearField?.required_if_subcategory_in?.includes(form.subcategory_key);

  const carYears = carYearField
    ? Array.from({ length: carYearField.max - carYearField.min + 1 }, (_, i) => carYearField.min + i)
    : [];

  async function publish() {
    setBusy(true);
    try {
      const title = await getDraftTitle();
      const images = await getDraftImages();

      if (!title) { window.location.href="/post"; return; }
      if (!images.length) { window.location.href="/post/images"; return; }

      if (!form.description.trim()) return alert("الوصف مطلوب");
      if (!form.province) return alert("المحافظة مطلوبة");
      if (!form.price) return alert("السعر مطلوب");
      if (!form.deal_type) return alert("نوع العرض مطلوب");
      if (carYearRequired && !form.car_year) return alert("سنة الصنع مطلوبة");

      // 1) create ad
      const body = {
        title,
        description: form.description,
        price: Number(String(form.price).replace(/[^\d.]/g,"")),
        currency: form.currency,
        province: form.province,
        category_key: form.category_key,
        subcategory_key: form.subcategory_key,
        deal_type: form.deal_type,
        car_year: carYearRequired ? Number(form.car_year) : null,
        car_model: form.car_model || undefined,
        whatsapp_e164: whatsappE164 || undefined,
        images: [],
      };

      const created = await apiPost("/api/ads", body);
      const id = created.id;

      // 2) upload images
      const fd = new FormData();
      for (const it of images) {
        const file = new File([it.blob], it.name || "image.webp", { type: it.type || "image/webp" });
        fd.append("images", file);
      }

      try {
        await apiPostForm(`/api/ad/${id}/images`, fd);
      } catch (e) {
        // rollback: delete ad so we never keep ad without images
        try { await apiDelete(`/api/ad/${id}`); } catch {}
        alert("فشل رفع الصور، لم يتم نشر الإعلان.");
        return;
      }

      await clearDraft();
      window.location.href = `/ad/${id}`;
    } finally {
      setBusy(false);
    }
  }

  if (!catalog) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <h1 style={{ margin: 0 }}>3/3 التفاصيل</h1>
          <div style={{ display:"flex", gap:10 }}>
            <Link className="btn" href="/post/images">← رجوع</Link>
            <Link className="btn" href="/">إلغاء</Link>
          </div>
        </div>

        <div className="hr" />

        <label className="muted">الوصف *</label>
        <textarea className="textarea" value={form.description} onChange={(e)=>set("description", e.target.value)} />

        <div className="row">
          <div style={{flex:1}}>
            <label className="muted">القسم *</label>
            <select className="select" value={form.category_key} onChange={(e)=>set("category_key", e.target.value)}>
              {categories.map(c => <option key={c.key} value={c.key}>{c.label_ar}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label className="muted">النوع *</label>
            <select className="select" value={form.subcategory_key} onChange={(e)=>set("subcategory_key", e.target.value)}>
              {subcategories.map(s => <option key={s.key} value={s.key}>{s.label_ar}</option>)}
            </select>
          </div>
        </div>

        <label className="muted">طريقة العرض *</label>
        <select className="select" value={form.deal_type} onChange={(e)=>set("deal_type", e.target.value)}>
          {dealTypes.map(d => <option key={d.key} value={d.key}>{d.label_ar}</option>)}
        </select>

        {carYearField ? (
          <>
            <label className="muted">سنة الصنع {carYearRequired ? "*" : ""}</label>
            <select className="select" value={form.car_year} onChange={(e)=>set("car_year", e.target.value)}>
              <option value="">اختر</option>
              {carYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <label className="muted">موديل (اختياري)</label>
            <input className="input" value={form.car_model} onChange={(e)=>set("car_model", e.target.value)} />
          </>
        ) : null}

        <label className="muted">المحافظة *</label>
        <select className="select" value={form.province} onChange={(e)=>set("province", e.target.value)}>
          <option value="">اختر</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <div className="row">
          <div style={{flex:1}}>
            <label className="muted">السعر *</label>
            <input className="input" value={form.price} onChange={(e)=>set("price", e.target.value)} />
          </div>
          <div style={{width:140}}>
            <label className="muted">العملة</label>
            <select className="select" value={form.currency} onChange={(e)=>set("currency", e.target.value)}>
              <option value="SYP">SYP</option>
            </select>
          </div>
        </div>

        <label className="muted">واتساب (اختياري)</label>
        <WhatsAppInput valueE164={whatsappE164} onChangeE164={setWhatsappE164} />

        <div className="hr" />
        <button className="btn btn-primary" disabled={busy} onClick={publish}>
          {busy ? "..." : "نشر الإعلان"}
        </button>
      </div>
    </div>
  );
}
