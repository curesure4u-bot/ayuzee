import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DoctorVerification = {
  is_verified: boolean;
  verification_status: string;
  rejection_reason: string | null;
  full_name: string;
};

const DoctorLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [doctor, setDoctor] = useState<DoctorVerification | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/doctor/auth", { replace: true });
        return;
      }
      const { data: doc } = await supabase
        .from("doctors")
        .select("is_verified, verification_status, rejection_reason, full_name")
        .eq("user_id", data.session.user.id)
        .maybeSingle();
      if (mounted) {
        setDoctor(doc as DoctorVerification | null);
        setChecking(false);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/doctor/auth", { replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/doctor/auth");
  };

  if (checking) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  // Block access until verified
  if (doctor && !doctor.is_verified) {
    const rejected = doctor.verification_status === "rejected";
    return (
      <div className="min-h-screen gradient-soft">
        <header className="h-16 flex items-center justify-between border-b border-border bg-card px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full gradient-leaf">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">Ayuzee Doctor</span>
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </header>

        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <Card className="w-full max-w-lg p-8 text-center shadow-elegant">
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${rejected ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
              {rejected ? <AlertCircle className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </span>
            <h1 className="mt-4 font-display text-2xl">
              {rejected ? "Verification rejected" : "Account under review"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {rejected
                ? "Unfortunately, we couldn't verify your account. See the reason below and contact support to resubmit."
                : "Hi " + (doctor.full_name?.split(" ")[1] ?? "Doctor") + ", we're reviewing your verification documents. You'll be notified within 24–48 hours."}
            </p>

            {rejected && doctor.rejection_reason && (
              <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Reason</p>
                <p className="mt-1 text-sm">{doctor.rejection_reason}</p>
              </div>
            )}

            {!rejected && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Review in progress</span>
                    <span>Step 2 of 3</span>
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-left text-sm">
                  <p className="font-medium">What happens next?</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Our team verifies your medical registration</li>
                    <li>• Identity & selfie cross-check</li>
                    <li>• Account activated and full panel unlocked</li>
                  </ul>
                </div>
              </div>
            )}

            <Button variant="outline" className="mt-6" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DoctorSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full gradient-leaf">
                  <Stethoscope className="h-4 w-4 text-primary-foreground" />
                </span>
                <span className="font-display text-lg font-semibold">Ayuzee Doctor</span>
              </Link>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DoctorLayout;
