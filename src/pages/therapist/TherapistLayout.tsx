import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, ListChecks, Wallet, User, LifeBuoy, Loader2, ShieldCheck, LogOut, CalendarClock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TherapistRow {
  id: string;
  user_id: string;
  full_name: string;
  verification_status: string;
  is_available: boolean;
}

const navItems = [
  { to: "/therapist", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/therapist/sessions", icon: ListChecks, label: "My Sessions" },
  { to: "/therapist/availability", icon: CalendarClock, label: "Availability" },
  { to: "/therapist/earnings", icon: Wallet, label: "Earnings" },
  { to: "/therapist/profile", icon: User, label: "Profile" },
  { to: "/therapist/support", icon: LifeBuoy, label: "Support" },
];

const TherapistLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<TherapistRow | null>(null);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/therapist/auth", { replace: true }); return; }
    const { data } = await supabase.from("therapists")
      .select("id, user_id, full_name, verification_status, is_available")
      .eq("user_id", session.user.id).maybeSingle();
    setTherapist((data as TherapistRow) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/therapist/auth", { replace: true });
    });
    load();
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailable = async (next: boolean) => {
    if (!therapist) return;
    const { error } = await supabase.from("therapists").update({ is_available: next }).eq("id", therapist.id);
    if (error) return toast({ title: "Could not update", description: error.message, variant: "destructive" });
    setTherapist({ ...therapist, is_available: next });
    toast({ title: next ? "You're online" : "You're offline" });
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!therapist) return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="p-10">
          <div className="mx-auto text-5xl">🤲</div>
          <h1 className="mt-4 text-2xl font-bold">Setting up your profile…</h1>
          <p className="mt-2 text-muted-foreground">
            Your therapist profile is being created. If this persists, please sign out and sign in again.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (therapist.verification_status !== "approved") {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-10">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center"><ShieldCheck className="h-8 w-8 text-primary" /></div>
            <h1 className="text-2xl font-bold mt-4">Account under review</h1>
            <p className="text-muted-foreground mt-2">Your therapist profile is currently <span className="font-medium capitalize">{therapist.verification_status}</span>. You'll be able to access the dashboard once an admin approves your verification.</p>
            <Button className="mt-6" variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>Sign out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="hidden md:flex w-60 shrink-0 border-r bg-card flex-col">
        <div className="p-5 border-b">
          <div className="text-xs text-muted-foreground">Therapist</div>
          <div className="font-semibold truncate">{therapist.full_name}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t space-y-1">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
            <Link to="/login-picker">⇄ Switch Portal</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" />Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="border-b bg-card px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${therapist.is_available ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            <span className="text-muted-foreground">{therapist.is_available ? "Online" : "Offline"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{therapist.is_available ? "Go offline" : "Go online"}</span>
            <Switch checked={therapist.is_available} onCheckedChange={toggleAvailable} />
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet context={{ therapist, reload: load }} />
        </div>
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t flex justify-around py-2">
          {navItems.slice(0, 5).map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] px-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="h-4 w-4" />{item.label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default TherapistLayout;
export type TherapistContext = { therapist: TherapistRow; reload: () => Promise<void> };
