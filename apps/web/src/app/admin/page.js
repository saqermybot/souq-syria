"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const LS_KEY = "souq_admin_token";

function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(LS_KEY) || "";
    if (t) setToken(t);
  }, []);

  async function load() {
    setErr("");
    if (!token) return;

    setBusy(true);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      qs.set("limit", "50");
      qs.set("offset", "0");

      const r = await fetch(apiUrl(`/api/admin/sellers?${qs.toString()}`), {
        headers: { "x-admin-token": token },
      });

      const ct = r.headers.get("content-type") || "";
      const text = await r.text();
      const data = ct.includes("application/json") ? JSON.parse(text || "{}") : null;

      if (!r.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP_${r.status}`);
      }

      setItems(data.items || []);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function saveToken() {
    const t = token.trim();
    if (!t) return;
    localStorage.setItem(LS_KEY, t);
    await load();
  }

  async function clearToken() {
    localStorage.removeItem(LS_KEY);
    setToken("");
    setItems([]);
    setErr("");
  }

  async function setVerified(sellerId, isVerified) {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch(apiUrl(`/api/admin/sellers/${sellerId}/verify`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ is_verified: !!isVerified }),
      });

      const data = await r.json();
      if (!r.ok || !data?.ok) throw new Error(data?.error || `HTTP_${r.status}`);

      // update row in place
      setItems((prev) =>
        prev.map((x) => (x.id === sellerId ? { ...x, is_verified: !!isVerified } : x))
      );
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  const canUse = useMemo(() => token.trim().length > 0, [token]);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>لوحة الأدمن</h1>
        <Link className="btn" href="/">← الرئيسية</Link>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body">
          <div className="muted">أدخل Admin Token (يُحفظ على جهازك فقط).</div>
          <div style={{ height: 10 }} />
          <div className="row">
            <input
              className="input"
              style={{ flex: 1 }}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ADMIN_TOKEN"
            />
            <button className="btn btn-primary" disabled={!canUse || busy} onClick={saveToken}>
              تفعيل
            </button>
            <button className="btn" disabled={busy} onClick={clearToken}>
              مسح
            </button>
          </div>

          <div style={{ height: 10 }} />
          <div className="row">
            <input
              className="input"
              style={{ flex: 1 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث: اسم شركة / اسم / guest_id"
              disabled={!canUse}
            />
            <button className="btn" disabled={!canUse || busy} onClick={load}>
              بحث
            </button>
          </div>

          {err ? <div style={{ marginTop: 10, color: "var(--danger)" }}>Error: {err}</div> : null}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 900 }}>الباعة</div>
            <div className="muted">{busy ? "..." : `${items.length} نتيجة`}</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "right" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>الاسم</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Company</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Verified</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Seller ID</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {s.display_name || "—"}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {s.company_name || "—"}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {s.is_verified ? "✅" : "—"}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      <a href={`/seller/${s.id}`} style={{ textDecoration: "underline" }}>{s.id}</a>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>
                      {s.is_verified ? (
                        <button className="btn" disabled={busy} onClick={() => setVerified(s.id, false)}>
                          إلغاء توثيق
                        </button>
                      ) : (
                        <button className="btn btn-primary" disabled={busy} onClick={() => setVerified(s.id, true)}>
                          توثيق
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "12px" }} className="muted">
                      لا توجد بيانات (أدخل التوكن ثم اضغط بحث).
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
