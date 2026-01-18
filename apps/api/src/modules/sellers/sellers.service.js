import { pool } from "../../db/pool.js";

export async function getOrCreateSellerByGuestId(guestId) {
  // upsert, then return row
  const r = await pool.query(
    `INSERT INTO sellers (guest_id)
     VALUES ($1)
     ON CONFLICT (guest_id) DO UPDATE SET updated_at = now()
     RETURNING id, guest_id, display_name, company_name, bio, phone_public, address_public, is_verified`,
    [guestId]
  );
  return r.rows[0];
}

export async function getSellerById(id) {
  const r = await pool.query(
    `SELECT id, display_name, company_name, bio, phone_public, address_public, is_verified
     FROM sellers
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return r.rows[0] || null;
}

export async function getSellerMe(guestId) {
  const r = await pool.query(
    `SELECT id, guest_id, display_name, company_name, bio, phone_public, address_public, is_verified
     FROM sellers
     WHERE guest_id = $1
     LIMIT 1`,
    [guestId]
  );
  return r.rows[0] || null;
}

export async function updateSellerMe(guestId, patch) {
  const r = await pool.query(
    `UPDATE sellers SET
        display_name = COALESCE($2, display_name),
        company_name = COALESCE($3, company_name),
        bio = COALESCE($4, bio),
        phone_public = COALESCE($5, phone_public),
        address_public = COALESCE($6, address_public),
        updated_at = now()
     WHERE guest_id = $1
     RETURNING id, guest_id, display_name, company_name, bio, phone_public, address_public, is_verified`,
    [guestId, patch.display_name, patch.company_name, patch.bio, patch.phone_public, patch.address_public]
  );
  return r.rows[0] || null;
}

export async function listAdsBySellerId(sellerId, limit = 30, offset = 0) {
  const r = await pool.query(
    `SELECT id, title, price, currency, province, category_key, subcategory_key,
            deal_type, car_year, images, favorites_count, views_count, created_at
     FROM ads
     WHERE seller_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [sellerId, limit, offset]
  );
  return r.rows;
}
