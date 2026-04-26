import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, DoorOpen, CalendarRange, Wallet, User, Loader2, ShieldCheck, LogOut } from "lucide-react";

export interface VenueRow {
  id: string;
  owner_user_id: string;
  name: string;
  type: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
}

const navItems = [
  { to: "/venue", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/venue/rooms", icon: DoorOpen, label: "My Rooms" },
  { to: "/venue/bookings", icon: CalendarRange, label: "Bookings" },
  { to: "/venue/revenue", icon: Wallet, label: "Revenue" },
  { to: "/venue/profile", icon: User, label: "Profile" },
];

const VenueLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState<VenueRow | null>(null);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/venue/auth", { replace: true }); return; }
    const { data } = await supabase.from("therapy_venues")
      .select("id, owner_user_id, name, type, is_verified, is_active")
      .eq("owner_user_id", session.user.id).maybeSingle();
    setVenue((data as VenueRow) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/venue/auth", { replace: true });
    });
    load();
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!venue) return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="p-10">
          <div className="mx-auto text-5xl">🏥</div>
          <h1 className="mt-4 text-2xl font-bold">Setting up your venue profile…</h1>
          <p className="mt-2 text-muted-foreground">
            Your venue profile is being created. If this persists, please sign out and sign in again.
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

  if (!venue.is_verified) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-10">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center"><ShieldCheck className="h-8 w-8 text-primary" /></div>
            <h1 className="text-2xl font-bold mt-4">Your venue is under review</h1>
            <p className="text-muted-foreground mt-2">Our team is verifying <span className="font-medium">{venue.name}</span>. You'll get full dashboard access once approved.</p>
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
          <div className="text-xs text-muted-foreground capitalize">{venue.type ?? "Venue"}</div>
          <div className="font-semibold truncate">{venue.name}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" />Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-8">
          <Outlet context={{ venue, reload: load }} />
        </div>
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t flex justify-around py-2">
          {navItems.map(item => (
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

export default VenueLayout;
export type VenueContext = { venue: VenueRow; reload: () => Promise<void> };
