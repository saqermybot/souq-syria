"use client";
import WhatsAppInput from "@/components/WhatsAppInput";

export default function FinishPricing({
  provinces,
  form,
  set,
  whatsappE164,
  setWhatsappE164,
}) {
  return (
    <>
      <label className="muted">السعر *</label>
      <div className="row">
        <input
          className="input"
          style={{ flex: 1, fontSize: 20, fontWeight: 900 }}
          value={form.price}
          onChange={(e)=>set("price", e.target.value)}
          placeholder="مثال: 2500000"
        />
        <div style={{ width: 150 }}>
          <select
            className="select"
            value={form.currency}
            onChange={(e)=>set("currency", e.target.value)}
            style={{ fontWeight: 900, color: "#fbbf24" }}
          >
            <option value="SYP">SYP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div style={{ height: 10 }} />
      <label className="muted">المحافظة *</label>
      <select className="select" value={form.province} onChange={(e)=>set("province", e.target.value)}>
        <option value="">اختر</option>
        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <div style={{ height: 10 }} />
      <label className="muted">واتساب (اختياري)</label>
      <WhatsAppInput valueE164={whatsappE164} onChangeE164={setWhatsappE164} />
    </>
  );
}
