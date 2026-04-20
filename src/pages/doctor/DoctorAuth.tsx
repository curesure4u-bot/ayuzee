import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

const DoctorAuth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login",
  );
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/doctor", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/doctor", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/doctor`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        const userId = data.user?.id;
        if (userId) {
          await supabase.from("doctors").insert({
            user_id: userId,
            full_name: fullName,
            email,
            phone,
            specialization: specialization || "Ayurvedic Practitioner",
            category: "general",
            city: city || "Not specified",
            is_approved: false,
            public_profile: false,
          });
          await supabase.from("user_roles").insert({ user_id: userId, role: "doctor" });
        }
        toast.success("Doctor account created! Awaiting admin approval.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, Doctor!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full gradient-leaf">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold">Ayuzee for Doctors</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            <h1 className="text-center font-display text-3xl">
              {mode === "login" ? "Doctor login" : "Join as a doctor"}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {mode === "login"
                ? "Access your practice dashboard"
                : "Grow your Ayurvedic practice with Ayuzee"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <Label htmlFor="fullName">Full name (with title)</Label>
                    <Input
                      id="fullName"
                      placeholder="Dr. Mohamad Saleem"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g. Panchakarma, Cosmetic Treatment"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create doctor account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New doctor?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Looking for patient login?{" "}
              <Link to="/auth" className="text-primary hover:underline">Click here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuth;
