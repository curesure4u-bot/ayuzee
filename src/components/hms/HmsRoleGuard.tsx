import { type ReactNode } from "react";
import { useAccountSession } from "@/features/accounts/accountService";
import { Shield, Loader2 } from "lucide-react";

/**
 * HMS Role-based access guard.
 * Wraps a page/section and only renders children if user has required role.
 *
 * Usage:
 *   <HmsRoleGuard allowedRoles={["doctor", "admin"]}>
 *     <DoctorOnlyContent />
 *   </HmsRoleGuard>
 */

export type HmsRole = "admin" | "doctor" | "receptionist" | "pharmacist" | "lab_tech" | "therapist" | "nurse" | "accountant" | "hr" | "manager";

interface HmsRoleGuardProps {
  allowedRoles: HmsRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

const knownRoles: HmsRole[] = ["admin", "doctor", "receptionist", "pharmacist", "lab_tech", "therapist", "nurse", "accountant", "hr", "manager"];
export const useHmsRole = () => {
  const account = useAccountSession();
  const uid = account.session?.user.id;
  const assigned = account.account?.roles ?? [];
  const roles = account.loading || account.error || !uid ? [] : knownRoles.filter(role =>
    assigned.includes(role) || (role === "admin" && assigned.includes("super_admin")));
  const hasRole = (role: HmsRole) => roles.includes(role) || roles.includes("admin");
  const hasAnyRole = (checkRoles: HmsRole[]) => checkRoles.some(hasRole);
  return { roles, loading: account.loading, hasRole, hasAnyRole };
};

export const HmsRoleGuard = ({ allowedRoles, children, fallback }: HmsRoleGuardProps) => {
  const { roles, loading, hasAnyRole } = useHmsRole();

  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center gap-3 py-12 text-lg">
        <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none text-muted-foreground" />
        <span>Checking your permissions…</span>
      </div>
    );
  }

  if (!hasAnyRole(allowedRoles)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-red-100 grid place-items-center mb-3">
          <Shield className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="font-semibold text-lg">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You don't have permission to access this section.
          Required role: {allowedRoles.join(" or ")}.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default HmsRoleGuard;
