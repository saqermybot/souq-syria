"use client";
import { useMemo, useState } from "react";

export default function ImageSlider({ images = [], alt = "image" }) {
  const list = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);
  const [i, setI] = useState(0);

  if (!list.length) return null;

  const n = list.length;
  const idx = ((i % n) + n) % n;

  function prev(e) { e?.preventDefault?.(); e?.stopPropagation?.(); setI((x) => x - 1); }
  function next(e) { e?.preventDefault?.(); e?.stopPropagation?.(); setI((x) => x + 1); }

  return (
    <div style={{ position: "relative" }}>
      <img
        src={list[idx]}
        alt={alt}
        style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }}
      />

      {n > 1 ? (
        <>
          {/* counter */}
          <div style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            padding: "6px 10px",
            borderRadius: 12,
            background: "rgba(0,0,0,.45)",
            color: "rgba(255,255,255,.92)",
            border: "1px solid rgba(255,255,255,.12)",
            fontSize: 12
          }}>
            {idx + 1}/{n}
          </div>

          {/* arrows */}
          <button onClick={prev} aria-label="prev" style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.18)",
            background: "rgba(0,0,0,.35)",
            color: "white",
            fontSize: 20,
            lineHeight: "40px",
            textAlign: "center"
          }}>‹</button>

          <button onClick={next} aria-label="next" style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.18)",
            background: "rgba(0,0,0,.35)",
            color: "white",
            fontSize: 20,
            lineHeight: "40px",
            textAlign: "center"
          }}>›</button>
        </>
      ) : null}
    </div>
  );
}
