"use client";
import { useEffect, useMemo, useState } from "react";
import { PhoneInput } from "react-international-phone";
import { parsePhoneNumberFromString } from "libphonenumber-js";

function guessDefaultCountry() {
  if (typeof navigator === "undefined") return "sy";
  const lang = (navigator.language || "").toLowerCase();
  const parts = lang.split("-");
  const iso2 = (parts[1] || "").toLowerCase();
  return iso2 || "sy";
}

export default function WhatsAppInput({ valueE164, onChangeE164 }) {
  const [raw, setRaw] = useState(valueE164 || "");
  const [touched, setTouched] = useState(false);
  const defaultCountry = useMemo(() => guessDefaultCountry(), []);

  useEffect(() => {
    if (!raw) {
      onChangeE164(undefined);
      return;
    }
    const p = parsePhoneNumberFromString(raw);
    if (p?.isValid()) onChangeE164(p.number);
    else onChangeE164(undefined);
  }, [raw]);

  const isValid = useMemo(() => {
    if (!raw) return true;
    const p = parsePhoneNumberFromString(raw);
    return !!p?.isValid();
  }, [raw]);

  return (
    <div>
      <PhoneInput
        defaultCountry={defaultCountry}
        value={raw}
        onChange={(v) => { setRaw(v); setTouched(true); }}
        placeholder="WhatsApp (اختياري)"
        style={{ width: "100%" }}
      />
      <div className="muted" style={{ marginTop: 6 }}>
        إذا أضفت الرقم سيظهر على الإعلان.
      </div>
      {!isValid && touched ? (
        <div style={{ marginTop: 6, color: "var(--danger)", fontSize: 13 }}>
          رقم غير صحيح. مثال: +9639xxxxxxx
        </div>
      ) : null}
    </div>
  );
}
