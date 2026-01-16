import fs from "fs/promises";
import path from "path";
import { pool } from "../../db/pool.js";

function getUploadsDir() {
  return process.env.UPLOADS_DIR || "/var/www/souq/uploads";
}

export async function createAd(ad, sellerGuestId) {
  const sql = `
    INSERT INTO ads
      (title, description, price, currency, phone_e164, province,
       category_key, subcategory_key, deal_type, car_year, images, seller_guest_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12)
    RETURNING id
  `;

  const params = [
    ad.title,
    ad.description,
    ad.price,
    ad.currency,
    ad.phone_e164,
    ad.province,
    ad.category_key,
    ad.subcategory_key,
    ad.deal_type,
    ad.car_year ?? null,
    JSON.stringify(ad.images || []),
    sellerGuestId,
  ];

  const r = await pool.query(sql, params);
  return r.rows[0].id;
}

export async function getAdById(id) {
  const r = await pool.query(
    `SELECT id, title, description, price, currency, phone_e164, province,
            category_key, subcategory_key, deal_type, car_year, images,
            favorites_count, views_count, created_at, seller_guest_id
     FROM ads
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return r.rows[0] || null;
}

export async function listAds(f) {
  const where = [];
  const params = [];
  let i = 1;

  const add = (sqlCond, val) => {
    where.push(sqlCond.replace("?", `$${i}`));
    params.push(val);
    i += 1;
  };

  if (f.query) {
    where.push(`(title ILIKE '%' || $${i} || '%' OR description ILIKE '%' || $${i} || '%')`);
    params.push(f.query);
    i += 1;
  }

  if (f.province) add(`province = ?`, f.province);
  if (f.category_key) add(`category_key = ?`, f.category_key);
  if (f.subcategory_key) add(`subcategory_key = ?`, f.subcategory_key);
  if (f.deal_type) add(`deal_type = ?`, f.deal_type);

  if (f.price_min) add(`price >= ?`, Number(f.price_min));
  if (f.price_max) add(`price <= ?`, Number(f.price_max));

  if (f.car_year_min) add(`car_year >= ?`, Number(f.car_year_min));
  if (f.car_year_max) add(`car_year <= ?`, Number(f.car_year_max));

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT id, title, price, currency, province, category_key, subcategory_key,
           deal_type, car_year, images, favorites_count, views_count, created_at
    FROM ads
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT $${i} OFFSET $${i + 1}
  `;

  params.push(f.limit);
  params.push(f.offset);

  const r = await pool.query(sql, params);
  return r.rows;
}

export async function deleteAd({ adId, guestId, admin }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const r = await client.query(
      "SELECT seller_guest_id FROM ads WHERE id=$1 FOR UPDATE",
      [adId]
    );
    if (r.rowCount === 0) {
      await client.query("ROLLBACK");
      return { ok: false, error: "NOT_FOUND" };
    }

    const seller = r.rows[0].seller_guest_id || "";

    if (!admin && seller && seller !== guestId) {
      await client.query("ROLLBACK");
      return { ok: false, error: "FORBIDDEN" };
    }

    // delete row (cascades favorites/views tables)
    await client.query("DELETE FROM ads WHERE id=$1", [adId]);
    await client.query("COMMIT");

    // delete images directory from disk
    const dir = path.join(getUploadsDir(), "ads", String(adId));
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    return { ok: true };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
