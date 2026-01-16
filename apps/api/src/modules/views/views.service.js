import { pool } from "../../db/pool.js";

const WINDOW_HOURS = 6;

export async function registerView({ adId, guestId }) {
  // 1) Ensure ad exists
  const ad = await pool.query("SELECT id FROM ads WHERE id=$1", [adId]);
  if (ad.rowCount === 0) return { ok: false, error: "NOT_FOUND" };

  // 2) Check if already viewed in last WINDOW_HOURS
  const recent = await pool.query(
    `SELECT 1
     FROM ad_views
     WHERE ad_id=$1 AND guest_id=$2
       AND viewed_at >= (now() - ($3 || ' hours')::interval)
     LIMIT 1`,
    [adId, guestId, String(WINDOW_HOURS)]
  );

  if (recent.rowCount > 0) {
    return { ok: true, counted: false };
  }

  // 3) Insert view row + increment counter (transaction)
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO ad_views (ad_id, guest_id) VALUES ($1,$2)",
      [adId, guestId]
    );
    await client.query(
      "UPDATE ads SET views_count = views_count + 1 WHERE id=$1",
      [adId]
    );
    await client.query("COMMIT");
    return { ok: true, counted: true };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
