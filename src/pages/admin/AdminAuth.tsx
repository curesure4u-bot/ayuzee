import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: row } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .in("role", ["admin", "super_admin"])
          .maybeSingle();
        if (row) navigate("/admin", { replace: true });
      }
    })();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // Verify admin role
    const { data: row } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id)
      .in("role", ["admin", "super_admin"])
      .maybeSingle();
    setLoading(false);
    if (!row) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access");
      return;
    }
    toast.success(`Signed in as ${row.role === "super_admin" ? "Super Admin" : "Admin"}`);
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
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
