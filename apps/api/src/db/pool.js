import pg from "pg";

function must(v, name) {
  if (!v) throw new Error(`MISSING_${name}`);
  return v;
}

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || "127.0.0.1",
      port: parseInt(process.env.PGPORT || "5432", 10),
      user: must(process.env.PGUSER, "PGUSER"),
      password: must(process.env.PGPASSWORD, "PGPASSWORD"),
      database: must(process.env.PGDATABASE, "PGDATABASE"),
    };

export const pool = new pg.Pool({
  ...connection,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
