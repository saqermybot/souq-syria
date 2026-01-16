/**
 * Single Source of Truth (Locked by docs/SPEC.md)
 * - Categories/Subcategories
 * - Per-category fields (used by: Post Ad + Details + Filters)
 * - Allowed filters per category
 */

export const CATALOG_VERSION = 1;

/**
 * Field definition (minimal v1)
 * type: "string" | "number" | "enum"
 */
export const FieldType = {
  STRING: "string",
  NUMBER: "number",
  ENUM: "enum",
};

/**
 * Common filters available everywhere (v1):
 * - query, province, price_min, price_max
 * - deal_type (allowed values per category)
 */
export const CommonFilters = {
  QUERY: "query",
  PROVINCE: "province",
  PRICE_MIN: "price_min",
  PRICE_MAX: "price_max",
  DEAL_TYPE: "deal_type",
};

export const categories = [
  {
    key: "cars",
    label_ar: "سيارات",
    label_en: "Cars",
    subcategories: [
      { key: "sedan", label_ar: "سيدان", label_en: "Sedan" },
      { key: "suv", label_ar: "SUV", label_en: "SUV" },
      { key: "pickup", label_ar: "بيك أب", label_en: "Pickup" },
      { key: "van", label_ar: "فان", label_en: "Van" },
      { key: "motorcycle", label_ar: "دراجات", label_en: "Motorcycles" },
      { key: "parts", label_ar: "قطع سيارات", label_en: "Parts" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [
      {
        key: "car_year",
        label_ar: "سنة الصنع",
        label_en: "Year",
        type: FieldType.NUMBER,
        required: false,
        min: 1970,
        max: 2035,
      },
    ],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
      "car_year_min",
      "car_year_max",
    ],
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
  },

  {
    key: "real_estate",
    label_ar: "عقارات",
    label_en: "Real Estate",
    subcategories: [
      { key: "apartment", label_ar: "شقة", label_en: "Apartment" },
      { key: "house", label_ar: "بيت", label_en: "House" },
      { key: "land", label_ar: "أرض", label_en: "Land" },
      { key: "commercial", label_ar: "تجاري", label_en: "Commercial" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "rent", label_ar: "إيجار", label_en: "Rent" },
      { key: "wanted", label_ar: "طلب", label_en: "Wanted" },
    ],
  },

  {
    key: "mobiles",
    label_ar: "موبايلات",
    label_en: "Mobiles",
    subcategories: [
      { key: "iphone", label_ar: "آيفون", label_en: "iPhone" },
      { key: "android", label_ar: "أندرويد", label_en: "Android" },
      { key: "accessories", label_ar: "اكسسوارات", label_en: "Accessories" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
  },

  {
    key: "electronics",
    label_ar: "إلكترونيات",
    label_en: "Electronics",
    subcategories: [
      { key: "tv", label_ar: "تلفزيونات", label_en: "TV" },
      { key: "laptops", label_ar: "لابتوبات", label_en: "Laptops" },
      { key: "cameras", label_ar: "كاميرات", label_en: "Cameras" },
      { key: "gaming", label_ar: "ألعاب", label_en: "Gaming" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
  },

  {
    key: "home",
    label_ar: "للبيت",
    label_en: "Home",
    subcategories: [
      { key: "furniture", label_ar: "أثاث", label_en: "Furniture" },
      { key: "appliances", label_ar: "أجهزة منزلية", label_en: "Appliances" },
      { key: "kitchen", label_ar: "مطبخ", label_en: "Kitchen" },
      { key: "decor", label_ar: "ديكور", label_en: "Decor" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
  },

  {
    key: "services",
    label_ar: "خدمات",
    label_en: "Services",
    subcategories: [
      { key: "transport", label_ar: "نقل", label_en: "Transport" },
      { key: "repair", label_ar: "تصليح", label_en: "Repair" },
      { key: "education", label_ar: "تعليم", label_en: "Education" },
      { key: "design", label_ar: "تصميم", label_en: "Design" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "offer", label_ar: "عرض", label_en: "Offer" },
      { key: "wanted", label_ar: "طلب", label_en: "Wanted" },
    ],
  },

  {
    key: "jobs",
    label_ar: "وظائف",
    label_en: "Jobs",
    subcategories: [
      { key: "full_time", label_ar: "دوام كامل", label_en: "Full-time" },
      { key: "part_time", label_ar: "دوام جزئي", label_en: "Part-time" },
      { key: "freelance", label_ar: "عمل حر", label_en: "Freelance" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "offer", label_ar: "عرض وظيفة", label_en: "Offer" },
      { key: "wanted", label_ar: "طلب عمل", label_en: "Wanted" },
    ],
  },

  {
    key: "other",
    label_ar: "أخرى",
    label_en: "Other",
    subcategories: [{ key: "other", label_ar: "أخرى", label_en: "Other" }],
    fields: [],
    filters: [
      CommonFilters.QUERY,
      CommonFilters.PROVINCE,
      CommonFilters.PRICE_MIN,
      CommonFilters.PRICE_MAX,
      CommonFilters.DEAL_TYPE,
    ],
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
  },
];
