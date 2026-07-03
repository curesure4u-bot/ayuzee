# Performance — portal route splitting

Phase 6 reduces the initial JavaScript bundle by splitting lazy page registries and deferring portal route registration.

## Architecture

```
main bundle (index ~18KB)
├── eager: redirects, auth, shop, diagnosis, public content routes
├── lazy SiteNav chunk
└── async after mount: student, patient, admin, doctor, vaidya, …

Per-portal chunks:
  portal-admin.ts   → only admin page lazy() wrappers
  routes-admin.tsx  → admin Route definitions
```

## Key files

| File | Role |
| --- | --- |
| `src/routes/lazy/{portal}.ts` | Per-portal lazy page registry (auto-generated) |
| `src/routes/lazy/lazyPage.ts` | Shared `lazyPage()` helper |
| `src/routes/AppRoutes.tsx` | Loads portal route trees after first paint |
| `scripts/generate-lazy-barrels.mjs` | Regenerates barrels from route usage |
| `vite.config.ts` | `portal-*` and `routes-*` manual chunks |

## Regenerating lazy barrels

After adding routes or lazy pages:

```bash
# Restore full registry if needed, then:
git show HEAD~1:src/routes/lazyPages.full.ts  # or keep a backup
node scripts/generate-lazy-barrels.mjs
```

The generator reads `lazyPages.ts` export blocks and each `*.routes.tsx` for `P.ComponentName` usage.

## Catch-all / 404 handling

`public.routes.tsx` exports `notFoundRoute` separately. While portal routes are loading, unknown paths show `RouteFallback` instead of 404.

## Verification

```bash
npm run build
ls -lh dist/assets/index*.js dist/assets/portal-*.js dist/assets/routes-*.js
npm run lighthouse   # optional — compares /, /doctors, /shop, /therapies
```

## Follow-ups

- Path-based portal prefetch (load `/admin` routes only when visiting admin)
- Split `SiteNav` mega-menu data into lazy sub-imports
- Further split `routes-auth` chunk (121KB) if it becomes a bottleneck
