"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPostForm, apiDelete } from "@/lib/api";
import { clearDraftText, loadDraftText, saveDraftText } from "@/lib/draftText";

import FinishSelectors from "@/components/post/FinishSelectors";
import FinishPricing from "@/components/post/FinishPricing";
import FinishImages from "@/components/post/FinishImages";

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
      // حفظ بيانات step2 في draft (للعودة)
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

        <FinishSelectors
          subcategories={subcategories}
          dealTypes={dealTypes}
          provinces={provinces}
          carYearField={carYearField}
          carYearRequired={carYearRequired}
          carYears={carYears}
          form={form}
          set={set}
        />

        <div className="hr" />

        <FinishPricing
          form={form}
          set={set}
          whatsappE164={whatsappE164}
          setWhatsappE164={setWhatsappE164}
        />

        <FinishImages
          files={files}
          setFiles={setFiles}
          busy={busy}
          status={status}
          onPublish={publish}
        />
      </div>
    </div>
  );
}
