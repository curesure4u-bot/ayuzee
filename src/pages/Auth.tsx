import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, ShieldCheck, Stethoscope, HeartPulse, Sparkles } from "lucide-react";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const refCode = params.get("ref") ?? "";
  const [mode, setMode] = useState<"login" | "signup">(refCode ? "signup" : initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/dashboard", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, phone, ref_code: refCode },
          },
        });
        if (error) throw error;
        toast.success(refCode ? "Account created via referral! Welcome 🌿" : "Account created! Welcome to Ayuzee 🌿");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Stethoscope, title: "1 Lakh+ certified Ayurveda doctors", desc: "Consult specialists across India in seconds." },
    { icon: HeartPulse, title: "Personalised wellness plans", desc: "Prakriti analysis, therapies and follow-ups." },
    { icon: ShieldCheck, title: "Authentic medicines, doorstep delivery", desc: "100% genuine products from verified brands." },
    { icon: Sparkles, title: "Free Ayuzee Money on signup", desc: "Earn credits on every consult and order." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Brand panel */}
        <div className="relative hidden overflow-hidden gradient-leaf lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

          <Link to="/" className="relative flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/15 backdrop-blur">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-semibold">Ayuzee</span>
          </Link>

          <div className="relative">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              India's most trusted Ayurveda care, now in your pocket.
            </h2>
            <p className="mt-3 max-w-md text-sm text-primary-foreground/85">
              Book consultations, order medicines, and follow personalised therapy plans — backed by certified Vaidyas.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-foreground/15 backdrop-blur">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-primary-foreground/80">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 text-xs text-primary-foreground/85">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="h-7 w-7 rounded-full border-2 border-primary/30 bg-primary-foreground/30" />
              ))}
            </div>
            <span>Joined by 5L+ patients across India</span>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex flex-col items-center justify-center gradient-soft p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="font-display text-xl font-semibold">Ayuzee</span>
            </Link>

            {/* Mode toggle pill */}
            <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                  mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back to Ayuzee" : "Begin your healing journey"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to access consultations, orders and your wellness plan."
                : "Create your patient account in less than a minute."}
            </p>

            {refCode && mode === "signup" && (
              <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                🎁 You were invited! Code <span className="font-mono font-semibold">{refCode}</span> applied.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      required
                      autoComplete="name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      autoComplete="tel"
                      className="h-11"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <ForgotPasswordDialog
                      defaultEmail={email}
                      trigger={
                        <button type="button" className="text-xs font-medium text-primary hover:underline">
                          Forgot password?
                        </button>
                      }
                    />
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="h-11"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="h-12 w-full text-base" disabled={loading}>
                {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to Ayuzee's{" "}
              <Link to="/" className="text-primary hover:underline">Terms</Link> &{" "}
              <Link to="/" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to Ayuzee?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? "Create an account" : "Sign in instead"}
              </button>
            </p>

            <div className="mt-6 rounded-xl border border-dashed border-border bg-card/60 p-3 text-center text-xs text-muted-foreground">
              Are you a Doctor, Therapist or Hospital?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Choose your role
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
