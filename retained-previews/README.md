# Retained feature implementations

Sai approved preserving unfinished features as explicit previews on 5 November
2026 while reviewing which features to retain or remove. This folder preserves
the original source byte-for-byte. It is an inactive reference archive, with no
imports from the active application and no executable entrypoint. It is not a
second project, duplicate clone, backend deployment or a collection of working
services. Source paths remain intact beneath `src/` for review and recovery.

The active `src/` entrypoints are real preview components that describe intended
use and perform no backend actions. Normal TypeScript checks still cover the
whole active application. No live-schema types were invented, no active files
were excluded from that check and no release/security check was disabled.

Read [the decision report](../docs/review/FEATURES_FOR_DECISION.md) and its
[detailed inventory](../docs/review/preview-feature-inventory.json). The inventory
records intended use, optional integrations, routes, missing API or contract
requirements, existing SQL plans and source hashes. SQL plans are source design
evidence, not claims that those objects are deployed. Earlier operational and
security findings stay open until the relevant workflow is implemented and
accepted. Descriptions inferred from code need business validation.

Do not reconnect an implementation by importing it from this directory. First
confirm the business need, reconcile its SQL contracts and roles, implement a
scoped data boundary, verify failure/retry/ownership behavior and obtain the
phase's hosted acceptance. Then restore the reviewed implementation through the
normal source route, update its inventory status and preserve its change history.
Any permanent removal awaits Sai's keep/remove decision.
