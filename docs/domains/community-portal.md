# Community portal — 4 November 2026

Phase 2 implementation on `Sai-Branch`. Local source/fixture acceptance only;
no new hosted schema changes, frontend deployment, paid services or Phase 3 work.

## Result

Replaced the 746-line feed and legacy post page with a shared community feature.
Patients see Community and Patient circle audiences; approved doctors see Community
and Doctor discussions. All other canonical workspaces can use Community. Content
moderators have explicit review controls. A URL/workspace label cannot grant a role.

The UI provides literal search, type/sort filters and bounded pagination; validated
post/poll composition, owned edits/deletion, persistent comments/likes/votes,
report reasons and recorded moderation, recipient-specific notifications, and
loading/empty/error/retry states. Failed saves retain their draft; failed writes do
not fabricate counts or successful outcomes. Author names are explicitly displayed
with published contributions. No unverified professional badge, remote media
upload or clinical record is introduced.

Removed the global notification component's fabricated appointments, orders and
sample messages. Its bell now opens the appropriate community panel; accounts
with multiple roles must choose a workspace. It invents no unread badge.

## Modules and integration

- `src/features/community/model.ts`: validated input/output and workspace audience contracts.
- `gateway.ts`: selected-workspace transport, cancellation, safe errors and validated write acknowledgements.
- `CommunityRoute.tsx`: existing account/role guard, user/workspace/revision cache boundary and proposed RPC adapter; private pages are noindex.
- `CommunityPortal.tsx`: navigation, URL filters, query state, notification and moderation panels.
- `Composer.tsx`: bounded accessible form and draft retention; poll choices/audience become immutable after publication.
- `PostCard.tsx`: comments, atomic desired-like state and poll interaction.
- `community.css`: readable branded desktop/tablet/mobile layout and reduced-motion support.

`src/pages/Feed.tsx` and `FeedPost.tsx` use the shared route. The production
`FeaturePreviewBoundary` still contains `/feed`; a test is not a release switch.
The existing global header remains responsible for production navigation. The
standalone review renders its own header.

## Database candidate

`supabase/review-candidates/phase2-community-portal.sql` reuses `feed_posts`,
`feed_comments`, `feed_likes`, `feed_poll_votes` and `unified_notifications`.
It adds a moderation flag, reports and a separate review log; neither reports nor
logs are exposed as browser tables. No existing rows are rewritten on install.

The public RPC is SECURITY INVOKER. Its implementation is private, uses a fixed
empty search path, checks the existing live-actor helper and a canonical database
role on every action, derives authorship and never uses editable Auth metadata.
Doctor access additionally requires current approval and no suspension. Moderators
are canonical admin/super_admin/content_admin grants, separate from doctor_admin.
Moderators may inspect community content; this grants no clinical permissions.

Restrictive read fences preserve parent audiences even with old permissive
policies. Browser direct feed writes are revoked; validated mutations lock the
parent, check ownership/scope and persist atomically. Counters and anonymous poll
results are derived from records rather than caller-supplied numbers. Vote/like
uniqueness makes retries idempotent. Choices and expiry are enforced server-side.
Author edits cannot restore a hidden post. Review decisions are append-only from
the browser and retained separately from content deletion.

Community reply notifications contain a generic message, not copied reply text.
The recipient alone can change read/dismiss state. Notification content/delivery
is server-owned and the legacy arbitrary-recipient creation RPC is revoked from
browser roles in the candidate. Review how other unreleased modules call that
helper before adopting this change live.

## Verification and limits

- Community UI/contract tests exercise role audiences, search, create/edit,
  draft failure retention, comments, failed likes, changing a single poll vote,
  reporting, moderation, durable notification state, safe links and cancellation.
- `scripts/community-permissions.test.mjs`: 18 PostgreSQL scenarios plus the
  parent suite, using the exact three earlier access migrations and synthetic
  community tables. Includes direct-write denial, cross-audience child records,
  spoofed authorship, notification forgery, transaction rollback, workspace
  separation, role revocation and suspension, ownership and stable pagination.
- `npm run typecheck:community` is a strict scoped check. The full application's
  existing schema/typecheck blockers remain; this does not replace that gate.
- Browser review at 390px: feed width equals viewport width; axe WCAG A/AA tests
  have 26 passes, zero violations and zero incomplete checks. Editor opens and
  closes with Escape. Desktop doctor audience visibility was checked. Screenshots
  are retained under `docs/release/community-*-2026-11-04.jpg`.
- `tests/browser/community` uses explicitly fictional members. Its localStorage
  persistence is review-only and is never imported by production routes. The
  real database candidate is tested separately; browser review is not proof of
  REST/JWT or hosted acceptance.

## Remaining Phase 2 acceptance

Local checklist is 5/8; hosted checklist remains 0/8. Profile/credential review,
public professional projection, remaining metadata/performance/accessibility
journeys and the representative capacity checkpoint stay open. Media uploads are
not enabled. Comments are bounded to the first 50 with a visible notice; a full
long-thread pagination design remains future work.

Before hosted adoption: reconcile exact deployed columns, triggers, table and
column grants, existing RPC consumers and other privileged write paths; preserve
rollback definitions, run native local REST/Auth integration and authorization
checks, then separately authorize and verify the candidate deployment. Do not
run this candidate against production merely because the fixture tests pass.
Actual released frontend and hosted recipient/audience tests are still required.
No live load tests or external email/provider calls were made.

For local review from this checkout, run `npm run preview:community` and open
`http://127.0.0.1:4183/feed`. The top review controls switch fictional identities,
simulate a connection failure, run axe or reset local review data.
