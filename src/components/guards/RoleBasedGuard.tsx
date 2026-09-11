import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";

type AllowedRole = "super_admin" | "admin" | "doctor" | "therapist" | "patient" | "receptionist" | "pharmacist" | "lab_tech" | "nurse";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AllowedRole[];
  deniedMessage?: string;
  redirectTo?: string;
}

/**
 * RoleBasedGuard — restricts access based on user roles.
 * Checks the user_roles table to verify if the current user
 * has one of the allowed roles.
 */
export default function RoleBasedGuard({ 
  children, 
  allowedRoles, 
  deniedMessage = "You don't have permission to view this page.",
  redirectTo = "/dashboard"
}: RoleGuardProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { 
          if (active) setState("denied"); 
          return; 
        }

        const { data: rows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", allowedRoles);

        if (active) setState(rows && rows.length > 0 ? "allowed" : "denied");
      } catch {
        if (active) setState("denied");
      }
    };
    check();
    return () => { active = false; };
  }, [allowedRoles]);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="max-w-md border-red-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" /> Access Restricted
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {deniedMessage}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={() => navigate(redirectTo)}>
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience guards for common use cases
export function HmsGuard({ children }: { children: ReactNode }) {
  return (
    <RoleBasedGuard 
      children={children} 
      allowedRoles={["super_admin", "admin", "doctor", "therapist", "receptionist", "pharmacist", "lab_tech", "nurse"]}
      deniedMessage="This area is restricted to HMS staff only (Admin, Doctor, Therapist, Receptionist, Pharmacist, Lab Tech, or Nurse)."
      redirectTo="/dashboard"
    />
  );
}

export function VaidyaGuard({ children }: { children: ReactNode }) {
  return (
    <RoleBasedGuard 
      children={children} 
      allowedRoles={["doctor", "super_admin", "admin"]}
      deniedMessage="This area is restricted to Doctors only."
      redirectTo="/dashboard"
    />
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <RoleBasedGuard 
      children={children} 
      allowedRoles={["super_admin", "admin"]}
      deniedMessage="This area is restricted to Administrators only."
      redirectTo="/dashboard"
    />
  );
}

export function SpineGuard({ children }: { children: ReactNode }) {
  return (
    <RoleBasedGuard 
      children={children} 
      allowedRoles={["super_admin", "admin", "doctor", "therapist"]}
      deniedMessage="This area is restricted to Spine module users (Doctor, Therapist, or Admin)."
      redirectTo="/dashboard"
    />
  );
}