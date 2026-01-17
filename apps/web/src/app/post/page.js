"use client";
import { useEffect, useMemo, useState } from "react";
import WhatsAppInput from "@/components/WhatsAppInput";
import { apiPost, apiPostForm } from "@/lib/api";

const CATALOG = [
  { key:"cars", label:"سيارات", subs:[{key:"sedan",label:"سيدان"},{key:"suv",label:"SUV"},{key:"pickup",label:"بيك أب"},{key:"van",label:"فان"},{key:"motorcycle",label:"دراجات"},{key:"parts",label:"قطع سيارات"},{key:"other",label:"أخرى"}] },
  { key:"real_estate", label:"عقارات", subs:[{key:"apartment",label:"شقة"},{key:"house",label:"بيت"},{key:"land",label:"أرض"},{key:"commercial",label:"تجاري"},{key:"other",label:"أخرى"}] },
  { key:"mobiles", label:"موبايلات", subs:[{key:"iphone",label:"آيفون"},{key:"android",label:"أندرويد"},{key:"accessories",label:"اكسسوارات"},{key:"other",label:"أخرى"}] },
  { key:"electronics", label:"إلكترونيات", subs:[{key:"tv",label:"تلفزيونات"},{key:"laptops",label:"لابتوبات"},{key:"cameras",label:"كاميرات"},{key:"gaming",label:"ألعاب"},{key:"other",label:"أخرى"}] },
  { key:"home", label:"للبيت", subs:[{key:"furniture",label:"أثاث"},{key:"appliances",label:"أجهزة منزلية"},{key:"kitchen",label:"مطبخ"},{key:"decor",label:"ديكور"},{key:"other",label:"أخرى"}] },
  { key:"services", label:"خدمات", subs:[{key:"transport",label:"نقل"},{key:"repair",label:"تصليح"},{key:"education",label:"تعليم"},{key:"design",label:"تصميم"},{key:"other",label:"أخرى"}] },
  { key:"jobs", label:"وظائف", subs:[{key:"full_time",label:"دوام كامل"},{key:"part_time",label:"دوام جزئي"},{key:"freelance",label:"عمل حر"},{key:"other",label:"أخرى"}] },
  { key:"other", label:"أخرى", subs:[{key:"other",label:"أخرى"}] },
];

export default function PostAd() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_key: "cars",
    subcategory_key: "sedan",
    deal_type: "sale",
    price: "1",
    currency: "SYP",
    province: "حلب",
    car_year: "",
  });

  const [whatsappE164, setWhatsappE164] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const cat = useMemo(() => CATALOG.find(c=>c.key===form.category_key), [form.category_key]);
  const subs = cat?.subs || [];

  useEffect(() => {
    if (!subs.find(s=>s.key===form.subcategory_key)) {
      setForm(f => ({...f, subcategory_key: subs[0]?.key || "other"}));
    }
  }, [form.category_key]);

  function set(k,v){ setForm(f=>({...f,[k]:v})); }

  async function submit(){
    setBusy(true);
    try{
      const body = {
        title: form.title,
        description: form.description,
        price: Number(form.price || 0),
        currency: form.currency,
        province: form.province,
        category_key: form.category_key,
        subcategory_key: form.subcategory_key,
        deal_type: form.deal_type,
        car_year: form.category_key==="cars" && form.car_year ? Number(form.car_year) : null,
        images: [],
        whatsapp_e164: whatsappE164 || undefined
      };

      const created = await apiPost("/api/ads", body);
      const id = created.id;

      if (files.length) {
        const fd = new FormData();
        for (const f of files.slice(0,5)) fd.append("images", f);
        await apiPostForm(`/api/ad/${id}/images`, fd);
      }

      window.location.href = `/ad/${id}`;
    }catch(e){
      alert("Failed: " + e.message);
    }finally{
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h1 style={{margin:"0 0 8px"}}>إضافة إعلان</h1>
        <div className="muted">واتساب اختياري، والرسائل افتراضية.</div>

        <div className="hr" />

        <label className="muted">ماذا تبيع؟</label>
        <input className="input" value={form.title} onChange={e=>set("title", e.target.value)} />

        <div style={{height:10}} />
        <label className="muted">الوصف</label>
        <textarea className="textarea" value={form.description} onChange={e=>set("description", e.target.value)} />

        <div style={{height:10}} />
        <div className="row">
          <div style={{flex:1}}>
            <label className="muted">القسم</label>
            <select className="select" value={form.category_key} onChange={e=>set("category_key", e.target.value)}>
              {CATALOG.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label className="muted">الفرع</label>
            <select className="select" value={form.subcategory_key} onChange={e=>set("subcategory_key", e.target.value)}>
              {subs.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {form.category_key==="cars" ? (
          <>
            <div style={{height:10}} />
            <label className="muted">سنة الصنع (اختياري)</label>
            <input className="input" value={form.car_year} onChange={e=>set("car_year", e.target.value)} placeholder="2012" />
          </>
        ) : null}

        <div style={{height:10}} />
        <div className="row">
          <div style={{flex:1}}>
            <label className="muted">السعر</label>
            <input className="input" value={form.price} onChange={e=>set("price", e.target.value)} />
          </div>
          <div style={{width:140}}>
            <label className="muted">العملة</label>
            <select className="select" value={form.currency} onChange={e=>set("currency", e.target.value)}>
              <option value="SYP">SYP</option>
            </select>
          </div>
        </div>

        <div style={{height:10}} />
        <label className="muted">المحافظة</label>
        <input className="input" value={form.province} onChange={e=>set("province", e.target.value)} />

        <div style={{height:10}} />
        <label className="muted">واتساب (اختياري)</label>
        <WhatsAppInput valueE164={whatsappE164} onChangeE164={setWhatsappE164} />

        <div style={{height:10}} />
        <label className="muted">الصور (حتى 5)</label>
        <input className="input" type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,5))} />

        <div style={{height:14}} />
        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? "..." : "نشر الإعلان"}
        </button>
      </div>
    </div>
  );
}
