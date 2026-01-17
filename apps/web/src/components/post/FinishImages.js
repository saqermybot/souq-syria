"use client";

export default function FinishImages({
  files,
  setFiles,
  busy,
  status,
  onPublish,
}) {
  return (
    <>
      <div className="hr" />
      <label className="muted">الصور * (1 إلى 5)</label>
      <input
        className="input"
        type="file"
        accept="image/*"
        multiple
        onChange={(e)=>setFiles(Array.from(e.target.files||[]).slice(0,5))}
      />
      <div className="muted" style={{ marginTop: 6 }}>المختار: {files.length}</div>

      <div className="hr" />
      <button className="btn btn-primary" disabled={busy} onClick={onPublish}>
        {busy ? (status || "...") : "نشر الإعلان"}
      </button>
    </>
  );
}
