import { pool } from "../../db/pool.js";

export async function listSellers({ q, limit, offset }) {
  const params = [];
  let i = 1;
  let where = "";

  if (q) {
    where = `WHERE (company_name ILIKE '%' || $${i} || '%' OR display_name ILIKE '%' || $${i} || '%' OR guest_id ILIKE '%' || $${i} || '%')`;
    params.push(q);
    i += 1;
  }

  params.push(limit);
  params.push(offset);

  const sql = `
    SELECT id, guest_id, display_name, company_name, bio, phone_public, address_public, is_verified, created_at
    FROM sellers
    ${where}
    ORDER BY created_at DESC
    LIMIT $${i} OFFSET $${i + 1}
  `;

  const r = await pool.query(sql, params);
  return r.rows;
}

export async function setSellerVerified({ sellerId, isVerified }) {
  const r = await pool.query(
    `UPDATE sellers SET is_verified = $2 WHERE id = $1 RETURNING id, is_verified`,
    [sellerId, !!isVerified]
  );
  if (r.rowCount === 0) return { ok: false, error: "NOT_FOUND" };
  return { ok: true, seller: r.rows[0] };
}
