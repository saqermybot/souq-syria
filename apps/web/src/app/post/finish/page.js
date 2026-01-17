"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WhatsAppInput from "@/components/WhatsAppInput";
import { apiGet, apiPost, apiPostForm, apiDelete } from "@/lib/api";
import { clearDraftText, loadDraftText, saveDraftText } from "@/lib/draftText";

async function convertToWebP(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;

  if (img.decode) await img.decode();
  else await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

  const maxW = 1600;
  const ratio = img.width > maxW ? maxW / img.width : 1;
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);

  const webpBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.78));
  if (webpBlob) return new File([webpBlob], (file.name || "image").replace(/\.\w+$/, ".webp"), { type: "image/webp" });

  const jpgBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (jpgBlob) return new File([jpgBlob], (file.name || "image").replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });

  throw new Error("IMAGE_CONVERT_FAILED");
}

export default function PostFinish() {
  const [catalog, setCatalog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const [draft, setDraft] = useState(null);
  const [files, setFiles] = useState([]);
  const [whatsappE164, setWhatsappE164] = useState(undefined);

  const [form, setForm] = useState({
    subcategory_key: "",
    deal_type: "",
    car_year: "",
    car_model: "",
    province: "",
    price: "",
    currency: "SYP",
  });

  useEffect(() => {
    (async () => {
      const d = loadDraftText();
      if (!d.title || !d.description || !d.category_key) {
        window.location.href = "/post";
        return;
      }
      setDraft(d);

      setForm(f => ({
        ...f,
        province: d.province || "",
        price: d.price || "",
        currency: d.currency || "SYP",
      }));
      setWhatsappE164(d.whatsapp_e164 || undefined);

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
  const provinces = catalog?.provinces || [];

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

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
    if (!form.province) return alert("اختر المحافظة");
    if (!form.price) return alert("اكتب السعر");

    setBusy(true);
    setStatus("جاري إنشاء الإعلان...");

    let id = null;

    try {
      // حفظ واتساب/السعر/المحافظة في draft قبل النشر
      saveDraftText({
        ...loadDraftText(),
        province: form.province,
        price: form.price,
        currency: form.currency,
        whatsapp_e164: whatsappE164 || undefined,
      });

      const body = {
        title: draft.title,
        description: draft.description,
        price: Number(String(form.price).replace(/[^\d.]/g,"")),
        currency: form.currency || "SYP",
        province: form.province,
        category_key: draft.category_key,
        subcategory_key: form.subcategory_key,
        deal_type: form.deal_type,
        car_year: carYearRequired ? Number(form.car_year) : null,
        car_model: form.car_model || undefined,
        ...(whatsappE164 && /^\+[1-9]\d{6,14}$/.test(whatsappE164) ? { whatsapp_e164: whatsappE164 } : {}),
        images: [],
      };

      const created = await apiPost("/api/ads", body);
      id = created.id;

      setStatus("جاري تجهيز الصور...");
      const converted = [];
      for (const f of files.slice(0,5)) converted.push(await convertToWebP(f));

      setStatus("جاري رفع الصور...");
      const fd = new FormData();
      for (const f of converted) fd.append("images", f);

      await apiPostForm(`/api/ad/${id}/images`, fd);

      clearDraftText();
      window.location.href = `/ad/${id}`;
    } catch (e) {
      if (id) {
        setStatus("فشل رفع الصور — يتم التراجع...");
        try { await apiDelete(`/api/ad/${id}`); } catch {}
      }
      alert("فشل: " + (e?.message || e) + "\nلم يتم نشر الإعلان.");
    } finally {
      setBusy(false);
      setStatus("");
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

        <div className="muted">الخطوة 2/2: التفاصيل + تواصل + صور.</div>
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
        ) : null}

        <div className="row">
          <div style={{flex:1}}>
            <label className="muted">المحافظة *</label>
            <select className="select" value={form.province} onChange={(e)=>set("province", e.target.value)}>
              <option value="">اختر</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label className="muted">السعر *</label>
            <div className="row">
              <input className="input" style={{flex:1}} value={form.price} onChange={(e)=>set("price", e.target.value)} />
              <div style={{width:140}}>
                <select className="select" value={form.currency} onChange={(e)=>set("currency", e.target.value)}>
                  <option value="SYP">SYP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <label className="muted">واتساب (اختياري)</label>
        <WhatsAppInput valueE164={whatsappE164} onChangeE164={setWhatsappE164} />

        <div className="hr" />
        <label className="muted">الصور * (1 إلى 5)</label>
        <input className="input" type="file" accept="image/*" multiple onChange={(e)=>setFiles(Array.from(e.target.files||[]).slice(0,5))} />
        <div className="muted" style={{ marginTop: 6 }}>المختار: {files.length}</div>

        <div className="hr" />
        <button className="btn btn-primary" disabled={busy} onClick={publish}>
          {busy ? (status || "...") : "نشر الإعلان"}
        </button>
      </div>
    </div>
  );
}
