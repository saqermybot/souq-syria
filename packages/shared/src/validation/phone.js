/**
 * Phone policy (Locked):
 * - Default country: SY
 * - Stored format: E.164 (+963...)
 * - UI auto-selects country; user types number only (frontend responsibility)
 *
 * Note: Real validation will use libphonenumber later.
 */

export const DEFAULT_COUNTRY_ISO2 = "SY";
