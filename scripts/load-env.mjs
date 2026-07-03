/**
 * Loads .env from project root when VITE_* vars are not already set (e.g. local scripts).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const loadEnvFile = () => {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) return;

  const envPath = path.join(ROOT, ".env");
  if (!existsSync(envPath)) return;

  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
};

export const PROJECT_ROOT = ROOT;
