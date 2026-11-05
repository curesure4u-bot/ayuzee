import { PortalNav } from '@/features/access/PortalNav';

// The application mounts this once, inside its release boundary. Informational
// preview pages must not initialize accounts through their legacy nav imports.
export const SiteNav = ({ appLevel = false }: { appLevel?: boolean }) =>
  appLevel ? <PortalNav appLevel /> : null;
