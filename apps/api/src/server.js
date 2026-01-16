import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on ${port}`);
});
