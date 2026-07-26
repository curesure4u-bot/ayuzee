import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { Building2, Loader2, ShieldAlert } from "lucide-react";

const HmsAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill in all fields");
    setLoading(true);

    // 1. Authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      return toast.error(authError.message);
    }

    // 2. Check HMS access approval
    const uid = authData.session?.user?.id;
    if (!uid) {
      setLoading(false);
      return toast.error("Authentication failed");
    }

    const { data: doctor } = await (supabase as any)
      .from("doctors")
      .select("hms_access")
      .eq("user_id", uid)
      .maybeSingle();

    setLoading(false);

    if (!doctor || !doctor.hms_access) {
      // Sign them out - they don't have access
      await supabase.auth.signOut();
      toast.error("HMS access not approved. Contact your administrator for approval.");
      return;
    }

    toast.success("Welcome to HMS Portal");
    navigate("/hms", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">HMS Portal</CardTitle>
          <p className="text-sm text-muted-foreground">Hospital Management System by Ayuzee</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
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
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          {/* Access Info */}
          <div className="mt-5 p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium">Authorized Access Only</p>
                <p className="mt-0.5">HMS access requires administrator approval. If you need access, contact your hospital admin or the Ayuzee team.</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need HMS access? Contact your hospital admin or{" "}
            <a href="/contact" className="underline text-primary">reach out to Ayuzee</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsAuth;
