/**
 * Single Source of Truth (Locked)
 * CATALOG_VERSION 3
 * - Categories/Subcategories (AR/EN)
 * - Deal types per category (required)
 * - Provinces list (Syria v1)
 * - Cars: car_year required except parts/accessories
 */

export const CATALOG_VERSION = 3;

export const provinces = [
  "حلب","دمشق","ريف دمشق","حمص","حماة","اللاذقية","طرطوس","إدلب","دير الزور",
  "الرقة","الحسكة","درعا","السويداء","القنيطرة"
];

export const FieldType = {
  STRING: "string",
  NUMBER: "number",
  ENUM: "enum",
};

export const categories = [
  // 1) Real estate
  {
    key: "real_estate",
    label_ar: "عقارات",
    label_en: "Real Estate",
    subcategories: [
      { key: "apartment", label_ar: "شقة", label_en: "Apartment" },
      { key: "free_house", label_ar: "بيت حر", label_en: "Detached House" },
      { key: "land", label_ar: "أرض", label_en: "Land" },
      { key: "shop", label_ar: "محل", label_en: "Shop" },
      { key: "warehouse", label_ar: "مستودع", label_en: "Warehouse" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "rent", label_ar: "إيجار", label_en: "Rent" },
    ],
    fields: [],
  },

  // 2) Cars
  {
    key: "cars",
    label_ar: "سيارات",
    label_en: "Cars",
    subcategories: [
      { key: "passenger", label_ar: "سياحية", label_en: "Passenger" },
      { key: "taxi", label_ar: "تكسي عمومي", label_en: "Taxi" },
      { key: "van", label_ar: "فان", label_en: "Van" },
      { key: "truck", label_ar: "شاحنة", label_en: "Truck" },
      { key: "parts_accessories", label_ar: "قطع وإكسسوارات", label_en: "Parts & Accessories" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "rent", label_ar: "إيجار", label_en: "Rent" },
    ],

    // year: required except parts_accessories (B)
    fields: [
      {
        key: "car_year",
        label_ar: "سنة الصنع",
        label_en: "Year",
        type: FieldType.NUMBER,
        required: true,
        min: 2000,
        max: 2026,
        required_if_subcategory_in: ["passenger", "taxi", "van", "truck"]
      },
      {
        key: "car_model",
        label_ar: "الموديل",
        label_en: "Model",
        type: FieldType.STRING,
        required: false
      }
    ],
  },

  // 3) Home furniture
  {
    key: "home_furniture",
    label_ar: "أثاث المنزل",
    label_en: "Home Furniture",
    subcategories: [
      { key: "bedroom", label_ar: "غرف نوم", label_en: "Bedrooms" },
      { key: "living", label_ar: "طقم جلوس", label_en: "Living sets" },
      { key: "kitchen", label_ar: "مطبخ", label_en: "Kitchen" },
      { key: "dining", label_ar: "طاولة طعام", label_en: "Dining table" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
    fields: [],
  },

  // 4) Electronics
  {
    key: "electronics",
    label_ar: "إلكترونيات",
    label_en: "Electronics",
    subcategories: [
      { key: "mobile", label_ar: "موبايل", label_en: "Mobile" },
      { key: "computer", label_ar: "كمبيوتر", label_en: "Computer" },
      { key: "tv", label_ar: "تلفزيون", label_en: "TV" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
    fields: [],
  },

  // 5) Electrical appliances
  {
    key: "appliances",
    label_ar: "كهربائيات",
    label_en: "Appliances",
    subcategories: [
      { key: "washer", label_ar: "غسالة", label_en: "Washer" },
      { key: "fridge", label_ar: "ثلاجة", label_en: "Fridge" },
      { key: "oven", label_ar: "فرن", label_en: "Oven" },
      { key: "microwave", label_ar: "ميكرويف", label_en: "Microwave" },
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
    fields: [],
  },

  // 6) Clothing & shoes
  {
    key: "clothing_shoes",
    label_ar: "ملابس وأحذية",
    label_en: "Clothing & Shoes",
    subcategories: [
      { key: "women", label_ar: "نسائي", label_en: "Women" },
      { key: "kids", label_ar: "ولادي", label_en: "Kids" },
      { key: "men", label_ar: "رجالي", label_en: "Men" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
    fields: [],
  },

  // 7) Jobs & services
  {
    key: "jobs_services",
    label_ar: "وظائف وخدمات",
    label_en: "Jobs & Services",
    subcategories: [
      { key: "jobs", label_ar: "وظائف", label_en: "Jobs" },
      { key: "services", label_ar: "خدمات", label_en: "Services" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "offer", label_ar: "عرض", label_en: "Offer" },
      { key: "wanted", label_ar: "طلب", label_en: "Wanted" },
    ],
    fields: [],
  },

  // 8) Other
  {
    key: "other",
    label_ar: "أخرى",
    label_en: "Other",
    subcategories: [
      { key: "other", label_ar: "أخرى", label_en: "Other" },
    ],
    deal_types_required: true,
    deal_types: [
      { key: "sale", label_ar: "بيع", label_en: "Sale" },
      { key: "wanted", label_ar: "شراء", label_en: "Wanted" },
    ],
    fields: [],
  },
];
