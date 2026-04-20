import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, Calendar, ShoppingBag, FileText, Heart } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  full_name: string | null;
  phone: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      setEmail(session.user.email ?? "");
      // Defer profile fetch to avoid deadlock
      setTimeout(() => loadProfile(session.user.id), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth", { replace: true });
        return;
      }
      setEmail(data.session.user.email ?? "");
      loadProfile(data.session.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const tiles = [
    { icon: Calendar, label: "My Appointments", desc: "Upcoming & past consultations", count: 0 },
    { icon: FileText, label: "Prescriptions", desc: "Digital prescriptions from doctors", count: 0 },
    { icon: ShoppingBag, label: "Orders", desc: "Medicine & product orders", count: 0 },
    { icon: Heart, label: "Health Profile", desc: "Your wellness details", count: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-xl font-semibold">Ayuzee</span>
          </a>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Dashboard</span>
          <h1 className="mt-2 font-display text-4xl">
            Namaste, {loading ? "…" : firstName} 🙏
          </h1>
          <p className="mt-2 text-muted-foreground">{email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <article key={t.label} className="group rounded-2xl border border-border bg-card p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition-smooth group-hover:gradient-leaf group-hover:text-primary-foreground">
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{t.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              {t.count !== null && (
                <p className="mt-4 font-display text-3xl">{t.count}</p>
              )}
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border gradient-soft p-8">
          <h2 className="font-display text-2xl">Ready for your next step?</h2>
          <p className="mt-2 text-muted-foreground">Find a doctor or browse authentic Ayurvedic medicines.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" onClick={() => navigate("/#doctors")}>Find a doctor</Button>
            <Button variant="outline" onClick={() => navigate("/#products")}>Shop medicines</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
