import { pool } from "../../db/pool.js";

export async function toggleFavorite({ adId, guestId }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ad = await client.query("SELECT id FROM ads WHERE id=$1", [adId]);
    if (ad.rowCount === 0) {
      await client.query("ROLLBACK");
      return { ok: false, error: "NOT_FOUND" };
    }

    const exists = await client.query(
      "SELECT id FROM favorites WHERE ad_id=$1 AND guest_id=$2 LIMIT 1",
      [adId, guestId]
    );

    if (exists.rowCount > 0) {
      await client.query("DELETE FROM favorites WHERE ad_id=$1 AND guest_id=$2", [adId, guestId]);
      await client.query(
        "UPDATE ads SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id=$1",
        [adId]
      );
      await client.query("COMMIT");
      return { ok: true, favorited: false };
    }

    await client.query("INSERT INTO favorites (ad_id, guest_id) VALUES ($1,$2)", [adId, guestId]);
    await client.query("UPDATE ads SET favorites_count = favorites_count + 1 WHERE id=$1", [adId]);
    await client.query("COMMIT");
    return { ok: true, favorited: true };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function listFavorites({ guestId, limit = 50, offset = 0 }) {
  const r = await pool.query(
    `SELECT a.id, a.title, a.price, a.currency, a.province, a.category_key, a.subcategory_key,
            a.deal_type, a.car_year, a.images, a.favorites_count, a.views_count, a.created_at,
            a.seller_id,
            COALESCE(s.company_name, s.display_name, 'Seller') AS seller_name
     FROM favorites f
     JOIN ads a ON a.id = f.ad_id
     LEFT JOIN sellers s ON s.id = a.seller_id
     WHERE f.guest_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [guestId, limit, offset]
  );
  return r.rows;
}

export async function listFavoriteIds({ guestId }) {
  const r = await pool.query(
    `SELECT ad_id
     FROM favorites
     WHERE guest_id = $1
     ORDER BY created_at DESC
     LIMIT 500`,
    [guestId]
  );
  return r.rows.map(x => String(x.ad_id));
}
