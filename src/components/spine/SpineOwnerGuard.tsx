import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";

/**
 * SpineOwnerGuard — restricts access to owner-only spine pages.
 * Only the practice owner (`super_admin`) can view the wrapped content.
 * Regular admins (who can access all other modules) are intentionally
 * excluded here, so implementation/owner-tier stays with the chief physician.
 */
export default function SpineOwnerGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (active) setState("denied"); return; }

        const { data: rows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["super_admin"]);

        if (active) setState(rows && rows.length > 0 ? "allowed" : "denied");
      } catch {
        if (active) setState("denied");
      }
    };
    check();
    return () => { active = false; };
  }, []);

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
              <Lock className="h-4 w-4" /> Owner Access Only
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              This area is restricted to the practice owner (Super Admin / Chief Physician).
              You don't have permission to view it.
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={() => navigate("/hms/spine-ayush")}>
              <ArrowLeft className="h-4 w-4" /> Back to Spine Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
