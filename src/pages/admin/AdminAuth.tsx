import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { useLoginThrottle } from "@/hooks/useLoginThrottle";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { checkBeforeLogin, recordAttempt, isLocked, lockMessage, remainingAttempts } = useLoginThrottle();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: rows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .in("role", ["admin", "super_admin"]);
        if (rows && rows.length > 0) navigate("/admin", { replace: true });
      }
    })();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const allowed = await checkBeforeLogin(email);
    if (!allowed) {
      toast.error(lockMessage || "Too many failed attempts. Please wait before trying again.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      await recordAttempt(email, false, null, error.message);
      toast.error(error.message);
      setLoading(false);
      return;
    }
    await recordAttempt(email, true, data.user?.id);
    // Verify admin role (user can have multiple roles, e.g. both admin + super_admin)
    const { data: rows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id)
      .in("role", ["admin", "super_admin"]);
    setLoading(false);
    if (!rows || rows.length === 0) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access");
      return;
    }
    const isSuper = rows.some((r) => r.role === "super_admin");
    toast.success(`Signed in as ${isSuper ? "Super Admin" : "Admin"}`);
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full gradient-leaf">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-semibold">Ayuzee Admin</span>
        </Link>

        <Card className="w-full max-w-md p-8 shadow-elegant">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Restricted area — admin & super admin only.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ayuzee.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <ForgotPasswordDialog
                  defaultEmail={email}
                  trigger={
                    <button type="button" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </button>
                  }
                />
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" variant="hero" disabled={loading || isLocked}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>

            {isLocked && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
                <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-800">{lockMessage}</p>
              </div>
            )}

            {!isLocked && remainingAttempts <= 2 && remainingAttempts > 0 && (
              <p className="text-xs text-amber-600 text-center">
                {remainingAttempts} attempt{remainingAttempts > 1 ? "s" : ""} remaining before temporary lockout
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need admin access? Contact a super admin to be promoted.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
