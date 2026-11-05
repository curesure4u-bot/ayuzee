# Dependency checkpoint — 4 November 2026

DOMPurify was upgraded from 3.4.14 to exact version 3.4.17 with lifecycle scripts
disabled. Only the root package declaration and the DOMPurify package entry
changed relative to the immediately preceding lockfile. The preceding package
and lockfile are preserved under the handover work directory.

The [upstream advisory](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7)
and [3.4.17 release](https://github.com/cure53/DOMPurify/releases/tag/3.4.17)
identify the patched version. The current application uses string sanitation;
the critical advisory describes additional DOM/template modes. This is a
preventive security patch, not proof that the application exercised that exploit.

Three focused sanitizer tests passed: retained safe formatting/destinations,
removed executable markup/handlers/script URLs, and plain-text output. Strict
account, access and directory checks also passed after the patch. The full unit
suite and production build have **not** been repeated after this dependency
change; repeat them on resume. Earlier results were 185 unit tests passing and
a successful production build with the existing large-chunk warning.

The install's audit reports **56 affected package entries: 37 moderate, 17 high,
two critical** (previously 57, including three critical). This is not a clean
dependency audit. Remaining work includes reviewed Vite/Vitest, Lighthouse,
presentation tooling, Zod and transitive advisory upgrades. Do not use
`npm audit fix --force` or suppress findings to claim Phase 0 completion.

No paid resource, hosting change or frontend deployment was involved.
