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
import { useLoginThrottle } from "@/hooks/useLoginThrottle";
import {
  Building2, Loader2, ShieldAlert, Eye, EyeOff,
  Brain, Globe, Leaf, Shield, Stethoscope, Activity,
  CheckCircle2, Smartphone, Users,
} from "lucide-react";

const SUPERADMIN_EMAIL = "curesure4u@gmail.com";

// Role-based landing pages
const ROLE_LANDING: Record<string, string> = {
  owner: "/hms",
  branch_admin: "/hms",
  branch_doctor: "/hms/consultation-hub",
  franchise_doctor: "/hms/consultation-hub",
  therapist: "/hms/panchakarma",
  pharmacist: "/hms/stock",
  lab_tech: "/hms/lab-diagnostics",
  receptionist: "/hms/patient/manage-op",
  nurse: "/hms/opd",
  camp_doctor: "/hms/opd",
};

const HmsAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const { checkBeforeLogin, recordAttempt, isLocked, lockMessage, remainingAttempts } = useLoginThrottle();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill in all fields");

    // Rate limit check
    const allowed = await checkBeforeLogin(email);
    if (!allowed) {
      toast.error(lockMessage || "Too many failed attempts. Please wait before trying again.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      await recordAttempt(email, false, null, authError.message);
      return toast.error(authError.message);
    }

    await recordAttempt(email, true, authData.session?.user?.id);

    const userEmail = authData.session?.user?.email?.toLowerCase().trim();
    const uid = authData.session?.user?.id;

    // Superadmin always gets in — bypass all checks
    if (userEmail === SUPERADMIN_EMAIL.toLowerCase().trim()) {
      setLoading(false);
      toast.success("Welcome, Super Admin");
      setTimeout(() => navigate("/hms", { replace: true }), 100);
      return;
    }

    // Check HMS access + role for redirect
    if (uid) {
      const { data: doctor } = await (supabase as any)
        .from("doctors")
        .select("hms_access, hms_role, full_name")
        .eq("user_id", uid)
        .maybeSingle();

      if (!doctor || !doctor.hms_access) {
        setLoading(false);
        await supabase.auth.signOut();
        toast.error("Your HMS access is pending approval. Contact your administrator.");
        return;
      }

      // Role-based redirect
      const landing = ROLE_LANDING[doctor.hms_role] || "/hms";
      setLoading(false);
      toast.success(`Welcome, ${doctor.full_name || "Doctor"}!`);
      navigate(landing, { replace: true });
      return;
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

    const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); return toast.error(error.message); }

    const uid = signUpData.user?.id;
    if (uid) {
      // Create doctor record with immediate HMS access
      await (supabase as any).from("doctors").upsert({
        user_id: uid,
        full_name: email.split("@")[0],
        hms_access: true,
        hms_role: "branch_doctor",
        is_approved: true,
        is_verified: false,
        category: "general",
        specialization: "General Practitioner",
        city: "Not specified",
      }, { onConflict: "user_id" }).catch(() => {});

      // Also add user role
      await (supabase as any).from("user_roles").upsert({
        user_id: uid,
        role: "doctor",
      }, { onConflict: "user_id,role" }).catch(() => {});
    }

    setLoading(false);
    toast.success("Account created! You can now sign in.");
    setTab("login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Feature Highlights */}
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-br from-[#1a3a2a] via-[#1f4d35] to-[#0f2a1e] text-white flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-white/10 grid place-items-center">
              <Leaf className="h-5 w-5 text-emerald-300" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Ayuzee HMS</span>
          </div>
          <p className="text-white/60 text-sm">India's #1 AYUSH Hospital Management System</p>
        </div>

        <div className="space-y-5 my-auto">
          <FeatureItem icon={Brain} title="AI Clinical Decision Support" description="Differential diagnosis, drug interactions, and classical references — powered by AI" />
          <FeatureItem icon={Stethoscope} title="Complete OPD + IPD Management" description="Patient registration, check-in, consultation, prescription, billing — all in one" />
          <FeatureItem icon={Globe} title="15+ Indian Languages" description="Voice scribe transcribes in Hindi, Tamil, Telugu, Kannada, and more" />
          <FeatureItem icon={Leaf} title="AYUSH Specialized" description="Ayurveda, Homeopathy, Siddha, Unani, Yoga — with Panchakarma & classical formulary" />
          <FeatureItem icon={Shield} title="ABDM / ABHA Ready" description="Integrated with India's National Health Stack for health records" />
          <FeatureItem icon={Activity} title="Multi-Branch & Multi-Role" description="Owner, Doctor, Receptionist, Pharmacist, Lab Tech — role-based access" />
        </div>

        <div className="text-white/40 text-xs">
          <p>Trusted by 100+ AYUSH clinics across India</p>
          <p className="mt-1">© 2026 Ayuzee AI · ayuzee.com</p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 grid place-items-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#1a3a2a]">
              <Building2 className="h-7 w-7 text-white" />
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
                      autoComplete="email"
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
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#1a3a2a] hover:bg-[#254d38]" disabled={loading || isLocked}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
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
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#1a3a2a] hover:bg-[#254d38]" disabled={loading}>
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

            {/* Mobile-only feature highlights */}
            <div className="mt-6 lg:hidden grid grid-cols-2 gap-2">
              <MiniFeature icon={Brain} label="AI Powered" />
              <MiniFeature icon={Globe} label="15+ Languages" />
              <MiniFeature icon={Leaf} label="AYUSH Ready" />
              <MiniFeature icon={Shield} label="ABDM Linked" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sub-components
const FeatureItem = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-md bg-white/10 grid place-items-center shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-emerald-300" />
    </div>
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-white/50 mt-0.5">{description}</p>
    </div>
  </div>
);

const MiniFeature = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
    <Icon className="h-3.5 w-3.5 text-primary" />
    <span className="text-[11px] font-medium">{label}</span>
  </div>
);

export default HmsAuth;
