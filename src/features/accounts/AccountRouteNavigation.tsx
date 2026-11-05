import { useLocation } from 'react-router-dom';
import { PublicPreviewNav } from '@/components/common/PublicPreviewNav';

const accountPaths = new Set(['/auth','/auth/callback','/account','/login','/reset-password',
  '/doctor/auth','/student/auth','/provider/auth','/therapist/auth','/venue/auth','/admin/auth','/hms/auth']);
export default function AccountRouteNavigation() {
  const { pathname } = useLocation();
  // Account screens have their own simple return-home header. Route policy
  // remains a separate fail-closed release boundary.
  return accountPaths.has(pathname.toLowerCase().replace(/\/$/, '')) || pathname.startsWith('/workspace/') ? null : <PublicPreviewNav />;
}
