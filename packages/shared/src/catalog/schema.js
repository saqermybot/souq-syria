/**
 * Single Source of Truth (Locked by docs/SPEC.md)
 * - Categories/Subcategories
 * - Per-category fields
 * - Allowed filters per category
 */

export const CATALOG_VERSION = 1;

/**
 * Category shape (informational):
 * {
 *   key: string,
 *   label_ar: string,
 *   label_en?: string,
 *   subcategories: { key: string, label_ar: string, label_en?: string }[],
 *   fields?: FieldDef[],          // fields used in post-ad + details + filter
 *   filters?: FilterDef[]         // allowed filters for this category
 * }
 */

export const categories = [
  // We'll fill this once (no experiments).
];
