"use client";

export default function FinishSelectors({
  subcategories,
  dealTypes,
  carYearField,
  carYearRequired,
  carYears,
  form,
  set,
}) {
  return (
    <>
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
    </>
  );
}
