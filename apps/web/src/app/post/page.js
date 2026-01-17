"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDraftTitle, saveDraftTitle } from "@/lib/draftStore";

export default function PostStepTitle() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    getDraftTitle().then(t => setTitle(t || ""));
  }, []);

  async function next() {
    const t = (title || "").trim();
    if (t.length < 2) return alert("اكتب عنوان واضح للإعلان");
    await saveDraftTitle(t);
    window.location.href = "/post/images";
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <h1 style={{ margin: 0 }}>1/3 العنوان</h1>
          <Link className="btn" href="/">← الرئيسية</Link>
        </div>

        <div className="hr" />

        <label className="muted">العنوان *</label>
        <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="ماذا تبيع؟" />

        <div style={{ height: 14 }} />
        <button className="btn btn-primary" onClick={next}>التالي</button>
      </div>
    </div>
  );
}
