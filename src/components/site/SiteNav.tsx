import { lazy, Suspense } from 'react';
const PortalNav = lazy(() => import('@/features/access/PortalNav').then(module => ({ default: module.PortalNav })));

// The application mounts this once, inside its release boundary. Informational
// preview pages must not initialize accounts through their legacy nav imports.
export const SiteNav = ({ appLevel = false }: { appLevel?: boolean }) =>
  appLevel ? <Suspense fallback={<p role="status">Loading navigation…</p>}><PortalNav appLevel /></Suspense> : null;
