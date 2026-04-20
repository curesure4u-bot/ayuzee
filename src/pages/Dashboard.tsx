import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, Calendar, ShoppingBag, FileText, Heart, Video, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Profile { full_name: string | null; phone: string | null; }
interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  mode: "video" | "in_clinic";
  status: string;
  fee: number;
  doctors: { full_name: string; specialization: string; clinic_name: string | null } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard — Ayuzee";
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth", { replace: true }); return; }
      setEmail(session.user.email ?? "");
      setTimeout(() => loadAll(session.user.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate("/auth", { replace: true }); return; }
      setEmail(data.session.user.email ?? "");
      loadAll(data.session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const [orderCount, setOrderCount] = useState(0);

  const loadAll = async (userId: string) => {
    const [{ data: prof }, { data: appts }, { count }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("user_id", userId).maybeSingle(),
      supabase
        .from("appointments")
        .select("id, appointment_date, time_slot, mode, status, fee, doctors(full_name, specialization, clinic_name)")
        .eq("user_id", userId)
        .order("appointment_date", { ascending: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    setProfile(prof);
    setAppointments((appts as unknown as Appointment[]) ?? []);
    setOrderCount(count ?? 0);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const upcoming = appointments.filter((a) => a.status !== "cancelled" && a.status !== "completed");

  const tiles = [
    { icon: Calendar, label: "Appointments", desc: "Upcoming consultations", count: upcoming.length },
    { icon: FileText, label: "Prescriptions", desc: "Digital prescriptions", count: 0 },
    { icon: ShoppingBag, label: "Orders", desc: "Medicine & products", count: orderCount },
    { icon: Heart, label: "Health Profile", desc: "Your wellness details", count: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-xl font-semibold">Ayuzee</span>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Dashboard</span>
          <h1 className="mt-2 font-display text-4xl">Namaste, {loading ? "…" : firstName} 🙏</h1>
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
              {t.count !== null && <p className="mt-4 font-display text-3xl">{t.count}</p>}
            </article>
          ))}
        </div>

        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl">Upcoming appointments</h2>
            <Button asChild variant="outline" size="sm"><Link to="/doctors">Book another</Link></Button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Loading…</div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No appointments yet</p>
              <p className="text-sm text-muted-foreground">Find a verified Ayurvedic doctor and book your first consultation.</p>
              <Button asChild variant="hero" className="mt-5"><Link to="/doctors">Find a doctor</Link></Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((a) => (
                <article key={a.id} className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                      {a.mode === "video" ? <Video className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{a.doctors?.full_name ?? "Doctor"}</h3>
                      <p className="text-sm text-muted-foreground">{a.doctors?.specialization}</p>
                      <p className="mt-1 text-sm">
                        {new Date(a.appointment_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {a.time_slot} · {a.mode === "video" ? "Video" : "In-clinic"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      a.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-secondary/15 text-secondary"
                    }`}>{a.status}</span>
                    <span className="font-display text-lg">₹{a.fee}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-12 rounded-2xl border border-border gradient-soft p-8">
          <h2 className="font-display text-2xl">Ready for your next step?</h2>
          <p className="mt-2 text-muted-foreground">Find a doctor or browse authentic Ayurvedic medicines.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" asChild><Link to="/doctors">Find a doctor</Link></Button>
            <Button variant="outline" asChild><Link to="/#products">Shop medicines</Link></Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
