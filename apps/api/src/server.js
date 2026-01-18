import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";

// Always load env from apps/api/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Accept either DATABASE_URL or PG* variables
const hasDb =
  !!process.env.DATABASE_URL ||
  (!!process.env.PGUSER && !!process.env.PGPASSWORD && !!process.env.PGDATABASE);

if (!hasDb) {
  console.error("FATAL: DB env missing. Set DATABASE_URL or PGUSER/PGPASSWORD/PGDATABASE in apps/api/.env");
  process.exit(1);
}

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on ${port}`);
});
