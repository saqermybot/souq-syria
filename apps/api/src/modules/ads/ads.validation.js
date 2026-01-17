import { z } from "zod";
import { categories, provinces } from "@souq/shared";

function findCategory(key) {
  return categories.find((c) => c.key === key) || null;
}

function findSubcategory(cat, subkey) {
  return cat.subcategories?.find((s) => s.key === subkey) || null;
}

function hasDealType(cat, dealType) {
  return !!cat.deal_types?.find((d) => d.key === dealType);
}

function getField(cat, key) {
  return (cat.fields || []).find((f) => f.key === key) || null;
}

export function validateAdId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return { ok: false, error: "BAD_ID" };
  return { ok: true, value: n };
}

export function validateListAdsQuery(q) {
  // ALL OPTIONAL (filters) – must match catalog keys, but not required
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
  const e164Optional = z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "BAD_WHATSAPP")
    .optional();

  const base = z.object({
    title: z.string().min(2).max(120),
    description: z.string().min(2).max(4000),

    price: z.number().finite().nonnegative(),
    currency: z.string().min(1).max(8).default("SYP"),

    // WhatsApp optional
    whatsapp_e164: e164Optional,

    // Province required
    province: z.string().min(2).max(50),

    category_key: z.string().min(1),
    subcategory_key: z.string().min(1),

    // Deal type required (we enforce using catalog)
    deal_type: z.string().min(1),

    // Cars fields
    car_year: z.number().int().nullable().optional(),
    car_model: z.string().max(60).optional(),

    images: z.array(z.string().url()).max(5).default([]),
  });

  const parsed = base.parse(body);

  // Province must be in catalog list
  if (!provinces.includes(parsed.province)) {
    return { ok: false, error: "BAD_PROVINCE" };
  }

  const cat = findCategory(parsed.category_key);
  if (!cat) return { ok: false, error: "BAD_CATEGORY" };

  const sub = findSubcategory(cat, parsed.subcategory_key);
  if (!sub) return { ok: false, error: "BAD_SUBCATEGORY" };

  // Deal type required & allowed
  if (cat.deal_types_required && !parsed.deal_type) {
    return { ok: false, error: "MISSING_DEAL_TYPE" };
  }
  if (parsed.deal_type && !hasDealType(cat, parsed.deal_type)) {
    return { ok: false, error: "BAD_DEAL_TYPE" };
  }

  // Cars: car_year rule B (required only for specific subcategories)
  const yearField = getField(cat, "car_year");
  if (yearField) {
    const requiredSubs = yearField.required_if_subcategory_in || [];
    const mustHaveYear = requiredSubs.includes(parsed.subcategory_key);

    if (mustHaveYear && (parsed.car_year === null || parsed.car_year === undefined)) {
      return { ok: false, error: "MISSING_CAR_YEAR" };
    }

    if (parsed.car_year != null) {
      if (typeof yearField.min === "number" && parsed.car_year < yearField.min) return { ok: false, error: "BAD_CAR_YEAR" };
      if (typeof yearField.max === "number" && parsed.car_year > yearField.max) return { ok: false, error: "BAD_CAR_YEAR" };
    }
  } else {
    // If category has no car_year field, reject any provided year
    if (parsed.car_year != null) return { ok: false, error: "FIELD_NOT_ALLOWED" };
  }

  return { ok: true, value: parsed };
}
