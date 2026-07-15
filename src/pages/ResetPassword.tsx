import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, KeyRound } from "lucide-react";
import { z } from "zod";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password is too long"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    // getSession() first — if the recovery token was already exchanged (e.g.
    // on page reload) we can enable the form immediately.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    // onAuthStateChange catches the initial PASSWORD_RECOVERY exchange as well
    // as any subsequent SIGNED_IN events that follow it.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        setReady(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetSchema.safeParse({ password, confirm });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — please sign in.");
      await supabase.auth.signOut();
      navigate("/auth?mode=login", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold">Ayuzee</span>
          </Link>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-center font-display text-3xl">Set a new password</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {ready ? "Choose a strong password you haven't used before." : "Verifying your reset link…"}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" name="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" />
              </div>
              <Button type="submit" data-testid="reset-password-submit" variant="hero" size="lg" className="w-full" disabled={loading || !ready}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it? <Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
