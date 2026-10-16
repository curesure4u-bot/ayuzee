# Ayuzee project working agreement

- Continue in the existing canonical checkout recorded in
  `docs/release/phase-0-code-handover.md`. On Sai's workstation, use that same
  folder across chats; do not create another clone or edit archived snapshots.
  A new chat must have the folder selected/accessible before making changes.
- The repository is `curesure4u-bot/ayuzee`; Sai's working branch is `Sai-Branch`.
  Check the current branch and working tree before editing. Preserve unrelated
  local work and do not switch branches silently.
- Sai authorized completing the Phase 0 source update and beginning Phase 1
  on 16 October 2026, after analysing modularity. Read the release handover,
  validation record, architecture assessment and audit before implementation.
  Obtain explicit permission before starting Phase 2 or later phases.
- Netlify/Supabase administration, hosted staging, secrets, deployments and
  database changes are deferred while Sai consults the administrator. Local
  source preparation does not authorize those actions.
- Sai authorized pushing the reviewed Phase 0 source changes to `Sai-Branch`
  when ready. Use `[skip netlify]` on the latest commit to preserve the hosting
  deferral. Do not push Phase 1 changes, merge, publish or deploy without a
  further explicit command. A source push does not establish release readiness.
- The intended audience is mostly aged 40+. Use readable text, generous button
  targets, persistent labels, predictable navigation and visible keyboard focus.
  Loading, empty and error states should explain what happened and the next
  action. Respect reduced motion and never fabricate successful service actions.
- Keep validation evidence honest: parser checks and focused tests do not
  establish a passing application typecheck, build, browser flow or live policy.
