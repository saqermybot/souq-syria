import { z } from "zod";
import { categories } from "@souq/shared";

function findCategory(key) {
  return categories.find((c) => c.key === key) || null;
}
function hasSubcategory(cat, subkey) {
  return !!cat.subcategories?.find((s) => s.key === subkey);
}
function hasDealType(cat, dealType) {
  return !!cat.deal_types?.find((d) => d.key === dealType);
}

export function validateAdId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return { ok: false, error: "BAD_ID" };
  return { ok: true, value: n };
}

export function validateListAdsQuery(q) {
  const schema = z.object({
    query: z.string().optional(),
    province: z.string().optional(),
    category_key: z.string().optional(),
    subcategory_key: z.string().optional(),
    deal_type: z.string().optional(),
    price_min: z.string().optional(),
    price_max: z.string().optional(),
    car_year_min: z.string().optional(),
    car_year_max: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  });

  const parsed = schema.parse(q);
  const limit = Math.min(Math.max(parseInt(parsed.limit || "20", 10) || 20, 1), 50);
  const offset = Math.max(parseInt(parsed.offset || "0", 10) || 0, 0);

  return { ok: true, value: { ...parsed, limit, offset } };
}

export function validateCreateAd(body) {
  const base = z.object({
    title: z.string().min(2).max(120),
    description: z.string().min(2).max(4000),

    price: z.number().finite().nonnegative(),
    currency: z.string().min(1).max(8).default("SYP"),

    phone_e164: z.string().regex(/^\+[1-9]\d{6,14}$/, "PHONE_E164_REQUIRED"),
    province: z.string().min(2).max(50),

    category_key: z.string().min(1),
    subcategory_key: z.string().min(1),

    deal_type: z.string().min(1).default("sale"),

    car_year: z.number().int().nullable().optional(),

    images: z.array(z.string().url()).max(3).default([]),
  });

  const parsed = base.parse(body);

  const cat = findCategory(parsed.category_key);
  if (!cat) return { ok: false, error: "BAD_CATEGORY" };
  if (!hasSubcategory(cat, parsed.subcategory_key)) return { ok: false, error: "BAD_SUBCATEGORY" };
  if (!hasDealType(cat, parsed.deal_type)) return { ok: false, error: "BAD_DEAL_TYPE" };

  if (parsed.category_key !== "cars" && parsed.car_year != null) {
    return { ok: false, error: "FIELD_NOT_ALLOWED" };
  }

  if (parsed.category_key === "cars" && parsed.car_year != null) {
    const yearField = (cat.fields || []).find((f) => f.key === "car_year");
    if (yearField?.min && parsed.car_year < yearField.min) return { ok: false, error: "BAD_CAR_YEAR" };
    if (yearField?.max && parsed.car_year > yearField.max) return { ok: false, error: "BAD_CAR_YEAR" };
  }

  return { ok: true, value: parsed };
}
