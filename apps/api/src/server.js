import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env FIRST (before importing app/db modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is missing (apps/api/.env not loaded)");
  process.exit(1);
}

const { createApp } = await import("./app.js");

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on ${port}`);
});
