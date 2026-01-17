"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDraftTitle, getDraftImages, saveDraftImagesItems } from "@/lib/draftStore";

const MAX = 5;

async function fileToWebpOrJpeg(file) {
  // Load into image
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;

  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
  });

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

  // Try webp first, fallback to jpeg
  const webpBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (webpBlob) return { blob: webpBlob, type: "image/webp" };

  const jpgBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (jpgBlob) return { blob: jpgBlob, type: "image/jpeg" };

  throw new Error("IMAGE_ENCODE_FAILED");
}

export default function PostStepImages() {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDraftImages().then(arr => setCount(arr.length)).catch(()=>{});
  }, []);

  async function onPick(e) {
    try {
      const title = await getDraftTitle();
      if (!title) { window.location.href = "/post"; return; }

      const files = Array.from(e.target.files || []).slice(0, MAX);
      if (!files.length) return;

      setBusy(true);

      const items = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const converted = await fileToWebpOrJpeg(f);
        items.push({
          name: `img-${Date.now()}-${i}.${converted.type === "image/webp" ? "webp" : "jpg"}`,
          type: converted.type,
          blob: converted.blob,
        });
      }

      await saveDraftImagesItems(items);
      setCount(items.length);
      alert("تم حفظ الصور ✅");
    } catch (err) {
      alert("تعذر حفظ الصور. تأكد أنك لست في Private. وإذا المشكلة مستمرة جرّب متصفح آخر.");
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    const title = await getDraftTitle();
    if (!title) { window.location.href = "/post"; return; }
    if (!count) return alert("اختر على الأقل صورة واحدة");
    window.location.href = "/post/details";
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

        <div className="muted">اختر 1 إلى 5 صور (إجباري). سيتم ضغطها وتحويلها قبل الرفع.</div>
        <div style={{ height: 10 }} />

        <div className="badge">الصور المختارة: {count}</div>
        <div style={{ height: 10 }} />

        <input className="input" type="file" accept="image/*" multiple disabled={busy} onChange={onPick} />

        <div style={{ height: 14 }} />
        <button className="btn btn-primary" disabled={busy} onClick={next}>
          {busy ? "..." : "التالي"}
        </button>
      </div>
    </div>
  );
}
