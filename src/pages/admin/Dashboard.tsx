import { Component, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StatsCards } from "@/components/admin/StatsCards";

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.error("[AdminDashboard]", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-medium text-destructive">Something went wrong loading the dashboard.</p>
          <p className="mt-1 text-sm text-muted-foreground">Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.title = "Super Admin Dashboard — Ayuzee";
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Sign in required");
        navigate("/admin/auth", { replace: true });
        return;
      }
      const uid = data.session.user.id;
      // Accept either 'super_admin' or 'admin' (this project's super admin role)
      const [a, b] = await Promise.all([
        supabase.rpc("has_role", { _user_id: uid, _role: "super_admin" as any }),
        supabase.rpc("has_role", { _user_id: uid, _role: "admin" as any }),
      ]);
      const allowed = Boolean(a.data) || Boolean(b.data);
      if (!allowed) {
        toast.error("Super Admin access required");
        navigate("/admin", { replace: true });
        return;
      }
      if (active) setChecking(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  if (checking) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-3xl">Super Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time platform statistics · auto-refreshing every 30 seconds.
          </p>
        </motion.div>
        <StatsCards />
      </div>
    </DashboardErrorBoundary>
  );
};

export default SuperAdminDashboard;
