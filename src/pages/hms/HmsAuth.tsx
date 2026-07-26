import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { Building2, Loader2, ShieldAlert } from "lucide-react";

const SUPERADMIN_EMAIL = "curesure4u@gmail.com";

const HmsAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill in all fields");
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      return toast.error(authError.message);
    }

    const userEmail = authData.session?.user?.email?.toLowerCase();
    const uid = authData.session?.user?.id;

    // Superadmin always gets in — no approval needed
    if (userEmail === SUPERADMIN_EMAIL) {
      setLoading(false);
      toast.success("Welcome, Super Admin");
      navigate("/hms", { replace: true });
      return;
    }

    // For all others, check hms_access approval
    if (uid) {
      const { data: doctor } = await (supabase as any)
        .from("doctors")
        .select("hms_access")
        .eq("user_id", uid)
        .maybeSingle();

      if (!doctor || !doctor.hms_access) {
        setLoading(false);
        await supabase.auth.signOut();
        toast.error("Your HMS access is pending approval. Please contact your administrator.");
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome to HMS Portal");
    navigate("/hms", { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill in all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Your access is pending admin approval. You'll be notified once approved.");
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
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  After sign up, your account needs admin approval before you can access HMS.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {/* Access Info */}
          <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                New accounts require administrator approval before HMS access is granted.
              </p>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Need HMS access? Contact your hospital admin or{" "}
            <a href="/contact" className="underline text-primary">reach out to Ayuzee</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsAuth;
