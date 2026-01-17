"use client";
import Link from "next/link";
import { useState } from "react";
import { getDraftTitle, saveDraftImages } from "@/lib/draftStore";

export default function PostStepImages() {
  const [files, setFiles] = useState([]);

  async function next() {
    try {
      const title = await getDraftTitle();
      if (!title) { window.location.href = "/post"; return; }

      if (!files.length) return alert("اختر على الأقل صورة واحدة");
      await saveDraftImages(files);

      window.location.href = "/post/details";
    } catch (e) {
      // Most common on iPhone: Private mode blocks IndexedDB
      alert("متصفحك يمنع حفظ الصور بين الصفحات (غالبًا لأنك في Private). افتح الموقع بتبويب عادي ثم جرّب مرة أخرى.");
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <h1 style={{ margin: 0 }}>2/3 الصور</h1>
          <div style={{ display:"flex", gap:10 }}>
            <Link className="btn" href="/post">← رجوع</Link>
            <Link className="btn" href="/">إلغاء</Link>
          </div>
        </div>

        <div className="hr" />

        <div className="muted">اختر 1 إلى 5 صور (إجباري). سيتم تحويلها تلقائيًا إلى WebP.</div>
        <div style={{ height: 10 }} />

        <input
          className="input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e)=>setFiles(Array.from(e.target.files || []).slice(0,5))}
        />

        <div style={{ height: 14 }} />
        <button className="btn btn-primary" onClick={next}>التالي</button>
      </div>
    </div>
  );
}
