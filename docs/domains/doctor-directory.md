# Doctor directory: first modernization slice

Prepared 2 November 2026 in the existing `Sai-Branch` checkout. Sai authorized local branch modernization for review by the project owner. This is Phase 2 source preparation alongside the existing Phase 0/1 work, not completion of those phases or authorization to enable unverified hosted services.

## Result

The old directory loaded every public doctor row and filtered/sorted in the browser. It also generated appointment times from the current clock, derived fake view counts from review counts, advertised online availability without presence data and confirmed callback requests without persisting them.

The replacement queries a bounded page of explicit public fields, applies filters and sorting on the server, validates the response and presents truthful loading/error/empty states. The existing `/doctors` page is now a small composition adapter. Its route and profile-link URLs remain compatible. Booking, callback and location/proximity claims are absent until their actual services are implemented.

## Ownership and structure

| File | Responsibility |
| --- | --- |
| `src/features/professionals/directoryModel.ts` | Browser-safe DTOs, query/filter types, bounded URL parsing and serialization |
| `directoryGateway.ts` | Runtime public-row validation, error boundary and database-row to domain-DTO mapping |
| `directoryService.ts` | Existing typed Supabase client, explicit projection, database filters, ordering, pagination and cancellation |
| `DoctorDirectory.tsx` | Search workflow, URL state, query lifecycle, cards and accessible interface |
| `src/pages/Doctors.tsx` | Existing site navigation/footer, SEO and feature composition |
| `tests/browser/directory/` | Isolated fictional-data review entrypoint; imports no hosted directory/Auth service |

The UI consumes `DirectorySource` and does not import the Supabase client. No generic repository abstraction, new client, framework or dependency was added. New feature source and its imports receive a strict TypeScript check; the existing full-application check remains unchanged.

## Query/data contract

- Read only `doctors_public`. Never fall back to the private `doctors` table.
- Request only the named public fields. Filter for `is_approved=true` and `public_profile=true`; validate these fields again before producing DTOs.
- Preserve null experience, fee and rating as unpublished. Preserve legitimate zero values. Show verification only for an explicit true flag and reviews only when a rating and positive review count exist.
- Page size is 12, page number is bounded to 1,000, text fields to 80 characters and optional maximum fee to a finite, nonnegative value. No default fee ceiling hides more expensive profiles.
- Name and city use separate text filters, not caller-controlled logical expressions. LIKE wildcards are escaped. Sort columns are selected from a fixed map; ID is the stable tie-breaker and nulls sort last.
- Filters run before range selection. Exact count belongs to the same filtered request. Malformed rows, missing/inconsistent counts and errors do not become empty successes.
- URL state includes search, city, category, consultation mode, maximum fee, sort and page. A new submitted search/sort starts on page one; browser back/reload restores filters.
- Query cancellation uses the supplied AbortSignal. An obsolete/late result cannot replace the current search. During a new request, stale cards are not presented as the new results.

These are application contracts, not proof of effective database authorization. The supplied public view filters suspended doctors, but its effective hosted definition, underlying RLS/grants and approved-field integrity still require inspection. Browser filters/validation do not prevent direct access to an incorrectly exposed server endpoint.

## Interface and scope choices

Readable text, native labelled controls, generous targets, visible focus, keyboard navigation, result announcements and error retry support the established audience. Results receive focus after a submitted search/page change. Empty results and an outdated/out-of-range bookmark have separate recovery actions.

The initial filter set is deliberately name, city, care system, consultation mode and maximum fee, with experience/rating/fee ordering. A global language/gender/experience facet design is not supplied by options derived from a single result page; broader facets should be added against reviewed query contracts. The previous geolocation approximation did not measure distance and is not advertised as proximity search. Photographs are replaced by initials in this slice, avoiding dependence on unreviewed external URLs.

## Local review

Run from the existing checkout:

```sh
npm run preview:directory
```

Open `http://127.0.0.1:4180/doctors`. The demo shows an explicit fictional-profile banner and uses 18 synthetic profiles, exercising two pages, search, sorting, empty state and URL restoration without project credentials. It is not imported into the production app. Profile/contact links outside the demo display a truthful review placeholder rather than simulating actions.

Source checks:

```sh
npm run test:directory
npm run typecheck:directory
npm run lint:directory
```

The existing automatic workflow now includes a directory job. The local hosting gate also requires directory lint/typechecks; its full unit run includes the directory tests. The gate continues to require full application checking and dependency review. No check or application file was excluded to obtain a pass.

## Verification on 2 November

- 20 feature tests pass: 14 filter/gateway/actual-SDK-transport tests and 6 rendered workflow tests.
- Complete Vitest suite: 86 tests pass in 13 files, including the same 20 feature tests. Legacy placeholders remain; do not add overlapping suite counts.
- Strict directory typecheck and targeted lint pass.
- Existing Phase 0: 15 Node tests; Phase 1: 31 Node-reported tests plus 43 account Vitest tests; hosting: 5 tests; handler checks: 2 tests, all pass. Phase 1 Node total includes enclosing tests.
- Production compilation passes with synthetic public configuration and a separate output folder. Existing large-chunk warnings remain. This is not a passing gated/live release.
- Real headless Chrome: 12/18 initial rows, 6 remaining rows, filtering/sorting, page reset, bookmark/reload, empty recovery and mobile layout verified. Automated WCAG A/AA checks reported no violations at desktop and 390px widths; this does not replace manual assistive-technology review. No runtime page errors, horizontal mobile overflow or hosted service calls were observed.
- Existing source hashes confirm that the other 1,711 previously inventoried code files were unchanged; intentional existing-code edits are the doctor page and local hosting gate. Package scripts/CI were extended while preserving their existing local edits. New feature/test/doc files are additional.

Detailed logs and screenshots are under the existing handover project's `outputs/directory-implementation-2026-11-02/`. They are local review artifacts outside the Git checkout; the application implementation and this document are inside the checkout.

## Release state and next dependency

The existing application preview boundary remains in force, including `/doctors`. No database migration, push, deployment or paid resource was performed. The Supabase connector still returned no accessible projects on 2 November, so the hosted view/policies and real anonymous discovery have not been tested.

Before enabling discovery, inspect the intended project's effective view/grants/policies and relevant doctor privilege protections, reconcile schema, and run anonymous/member/owner/admin denial tests in isolated staging. Review public profile details and the professional approval workflow next. Phase 0/1 release requirements continue to apply.

Official APIs checked: [Supabase range](https://supabase.com/docs/reference/javascript/range) and [TanStack Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation). Pagination is inclusive in the underlying range API; the implementation requests offsets `first` through `first + 11`.
