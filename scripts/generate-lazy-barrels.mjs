#!/usr/bin/env node
/**
 * Generates per-portal lazy page barrels from lazyPages.ts + route file usage.
 * Run: node scripts/generate-lazy-barrels.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routesDir = path.join(ROOT, "src", "routes");
const lazyDir = path.join(routesDir, "lazy");
const lazyPagesPath = path.join(routesDir, "lazyPages.full.ts");

mkdirSync(lazyDir, { recursive: true });

const lazyPagesSource = readFileSync(lazyPagesPath, "utf8");
const exportBlocks = new Map();

const exportPattern = /^export const (\w+) = [\s\S]*?;\s*$/gm;
let blockMatch;
while ((blockMatch = exportPattern.exec(lazyPagesSource)) !== null) {
  const name = blockMatch[1];
  if (name === "lazyPage") continue;
  exportBlocks.set(name, blockMatch[0].trimEnd());
}

const routeFiles = readdirSync(routesDir)
  .filter((f) => f.endsWith(".routes.tsx") && f !== "redirects.routes.tsx");

const barrelToExports = new Map();

for (const routeFile of routeFiles) {
  const barrelName = routeFile.replace(".routes.tsx", "");
  const content = readFileSync(path.join(routesDir, routeFile), "utf8");
  const used = [...content.matchAll(/P\.(\w+)/g)].map((m) => m[1]);
  const unique = [...new Set(used)].sort();

  if (!unique.length) continue;
  barrelToExports.set(barrelName, unique);

  const lines = unique
    .map((name) => {
      const exportBlock = exportBlocks.get(name);
      if (!exportBlock) {
        console.warn(`[generate-lazy-barrels] Missing export: ${name} in ${routeFile}`);
        return null;
      }
      return exportBlock;
    })
    .filter(Boolean);

  const barrelPath = path.join(lazyDir, `${barrelName}.ts`);
  writeFileSync(
    barrelPath,
    `/** Auto-generated — run \`node scripts/generate-lazy-barrels.mjs\` */\nimport { lazyPage } from "@/routes/lazy/lazyPage";\n\n${lines.join("\n")}\n`,
  );

  const updatedRoute = content.replace(
    'import * as P from "@/routes/lazyPages";',
    `import * as P from "@/routes/lazy/${barrelName}";`,
  );
  writeFileSync(path.join(routesDir, routeFile), updatedRoute);
}

writeFileSync(
  path.join(lazyDir, "lazyPage.ts"),
  `import { lazy, type ComponentType } from "react";

export const lazyPage = <T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) => lazy(factory);
`,
);

// Backwards-compatible re-export stub
writeFileSync(
  path.join(routesDir, "lazyPages.ts"),
  `/** @deprecated Import from @/routes/lazy/{portal} instead */\nexport { lazyPage } from "@/routes/lazy/lazyPage";\n`,
);

console.log(
  `[generate-lazy-barrels] Wrote ${barrelToExports.size} barrels:`,
  [...barrelToExports.keys()].join(", "),
);
