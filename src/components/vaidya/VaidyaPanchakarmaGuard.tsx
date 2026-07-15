import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * Restricts /vaidya/panchakarma/* to users with the `doctor` (Vaidya) role.
 * Admins / super_admins are allowed through for oversight.
 */
export default function VaidyaPanchakarmaGuard() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/doctor/auth", { replace: true });
        return;
      }
      const uid = sess.session.user.id;
      const [vaidya, admin, superAdmin] = await Promise.all([
        supabase.rpc("has_role", { _user_id: uid, _role: "doctor" as any }),
        supabase.rpc("has_role", { _user_id: uid, _role: "admin" as any }),
        supabase.rpc("has_role", { _user_id: uid, _role: "super_admin" as any }),
      ]);
      if (!alive) return;
      const allowed = Boolean(vaidya.data || admin.data || superAdmin.data);
      setState(allowed ? "ok" : "denied");
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  if (state === "checking") {
    return (
      <div className="grid min-h-[40vh] place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="font-display text-xl font-semibold">Vaidya access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The Panchakarma workspace is restricted to registered Vaidyas.
          Ask an administrator to assign you the Vaidya (doctor) role if you
          believe this is an error.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate("/vaidya")}>
            Back to Vaidya home
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
