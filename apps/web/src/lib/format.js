export function digitsOnly(s) {
  return String(s ?? "").replace(/[^\d]/g, "");
}

export function formatThousands(nStr) {
  const d = digitsOnly(nStr);
  if (!d) return "";
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPrice(value, currency) {
  // value can be "4200000000.00" or number
  const raw = String(value ?? "");
  const intPart = raw.split(".")[0];
  const pretty = formatThousands(intPart);
  if (!pretty) return "";
  return currency ? `${pretty} ${currency}` : pretty;
}

export function clampOneLine(s, max = 60) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}
