import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuthContext } from "@/providers/AuthProvider";
import type { PortalRole } from "@/providers/auth-types";
import { useRoleContext } from "@/providers/RoleProvider";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireRoles?: PortalRole[];
  loadingLabel?: string;
}

export const ProtectedRoute = ({
  children,
  redirectTo = "/auth",
  requireRoles,
  loadingLabel,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthContext();
  const { loading: roleLoading, hasRole } = useRoleContext();

  const waitingForRoles = requireRoles && requireRoles.length > 0;
  const loading = authLoading || (waitingForRoles && roleLoading);
  const authorized =
    !!session && (!waitingForRoles || requireRoles.some((role) => hasRole(role)));

  useEffect(() => {
    if (loading) return;
    if (!authorized) {
      navigate(redirectTo, { replace: true });
    }
  }, [authorized, loading, navigate, redirectTo]);

  if (loading) {
    return <AuthLoadingScreen label={loadingLabel} />;
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};
