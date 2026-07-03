#!/usr/bin/env node
/**
 * Static security audit for migrations + Supabase config.
 * Usage: npm run audit:security
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PHI_TABLES = [
  "profiles",
  "appointments",
  "consultations",
  "vaidya_consultations",
  "vaidya_patients",
  "prescription_orders",
  "formulary_prescriptions",
  "homeo_prescriptions",
  "homeopathy_prescriptions",
  "atmri_sponsored_cases",
  "patient_vitals",
  "posture_assessments",
  "orders",
  "user_consent_records",
  "deletion_requests",
];

const PRIVATE_BUCKETS = [
  "prescriptions",
  "patient-files",
  "posture-images",
  "doctor-documents",
  "student-docs",
  "therapist-docs",
  "venue-docs",
];

const migrationsDir = path.join(ROOT, "supabase", "migrations");
const migrationSql = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .map((file) => readFileSync(path.join(migrationsDir, file), "utf8"))
  .join("\n");

let exitCode = 0;
const warn = (message) => console.warn(`[audit:security] WARN: ${message}`);
const fail = (message) => {
  console.error(`[audit:security] FAIL: ${message}`);
  exitCode = 1;
};

for (const table of PHI_TABLES) {
  const created = new RegExp(`CREATE TABLE(?: IF NOT EXISTS)?\\s+public\\.${table}\\b`, "i").test(migrationSql);
  if (!created) continue;

  const hasRls = new RegExp(
    `ALTER TABLE\\s+public\\.${table}\\s+ENABLE ROW LEVEL SECURITY`,
    "i",
  ).test(migrationSql);

  if (!hasRls) {
    fail(`Table public.${table} has no ENABLE ROW LEVEL SECURITY migration`);
  }
}

const bucketInserts =
  migrationSql.match(/INSERT\s+INTO\s+storage\.buckets[\s\S]*?;/gi) ?? [];

for (const bucket of PRIVATE_BUCKETS) {
  const insertStmt = bucketInserts.find((insert) => insert.includes(`'${bucket}'`));
  if (!insertStmt) continue;

  const valuesMatch = insertStmt.match(
    new RegExp(`'${bucket}'\\s*,\\s*'${bucket}'\\s*,\\s*(true|false)`, "i"),
  );
  if (valuesMatch?.[1]?.toLowerCase() === "true") {
    fail(`Storage bucket ${bucket} is marked public in migrations`);
  }

  const conflictMatch = insertStmt.match(
    /ON\s+CONFLICT[\s\S]*?public\s*=\s*(true|false)/i,
  );
  if (conflictMatch?.[1]?.toLowerCase() === "true") {
    fail(`Storage bucket ${bucket} is set public via ON CONFLICT in migrations`);
  }
}

const configToml = readFileSync(path.join(ROOT, "supabase", "config.toml"), "utf8");
const jwtDisabled = [...configToml.matchAll(/\[functions\.([^\]]+)\][\s\S]*?verify_jwt\s*=\s*false/g)];
if (jwtDisabled.length) {
  warn(
    `Edge functions with verify_jwt=false: ${jwtDisabled.map((m) => m[1]).join(", ")} — ensure in-function auth is enforced`,
  );
}

if (migrationSql.includes("getPublicUrl") || migrationSql.includes("publicUrl")) {
  warn("Migrations reference public URLs — verify private buckets use signed URLs in app code");
}

const srcDir = path.join(ROOT, "src");
const scanSrc = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scanSrc(full);
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      const content = readFileSync(full, "utf8");
      if (content.includes('from("prescriptions")') && content.includes("getPublicUrl")) {
        fail(`getPublicUrl used with prescriptions bucket in ${path.relative(ROOT, full)}`);
      }
    }
  }
};
scanSrc(srcDir);

if (exitCode === 0) {
  console.log("[audit:security] PASS — no critical issues found");
} else {
  console.log("[audit:security] Completed with failures");
}

process.exit(exitCode);
