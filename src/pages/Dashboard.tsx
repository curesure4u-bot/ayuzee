import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, Calendar, ShoppingBag, FileText, Heart, Video, Building2, Gift, Truck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { PatientTherapyPlans } from "@/components/dashboard/PatientTherapyPlans";
import { PrakritiHistory } from "@/components/dashboard/PrakritiHistory";
import { PatientOnboarding } from "@/components/onboarding/PatientOnboarding";
import { WellnessScore } from "@/components/dashboard/WellnessScore";
import { VitalsTracker } from "@/components/dashboard/VitalsTracker";
import { HomeopathyCard } from "@/components/dashboard/HomeopathyCard";
import { SwasthavrittaPlanCard } from "@/components/dashboard/SwasthavrittaPlanCard";

interface Profile { full_name: string | null; phone: string | null; date_of_birth: string | null; gender: string | null; }
interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  mode: "video" | "in_clinic";
  status: string;
  fee: number;
  pre_form_submitted?: boolean;
  doctors: { full_name: string; specialization: string; clinic_name: string | null } | null;
}

const Dashboard = () => {
  usePageSEO({ title: "Dashboard — Ayuzee" });
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth", { replace: true }); return; }
      setEmail(session.user.email ?? "");
      setUserId(session.user.id);
      setTimeout(() => loadAll(session.user.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate("/auth", { replace: true }); return; }
      setEmail(data.session.user.email ?? "");
      setUserId(data.session.user.id);
      loadAll(data.session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const [orderCount, setOrderCount] = useState(0);

  const loadAll = async (userId: string) => {
    const [{ data: prof }, { data: appts }, { count }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, date_of_birth, gender").eq("user_id", userId).maybeSingle(),
      supabase
        .from("appointments")
        .select("id, appointment_date, time_slot, mode, status, fee, pre_form_submitted, doctors(full_name, specialization, clinic_name)")
        .eq("user_id", userId)
        .order("appointment_date", { ascending: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    const isComplete = localStorage.getItem("ayuzee_onboarding_complete");
    const isNewUser = !prof?.date_of_birth && !prof?.gender;
    if (!isComplete && isNewUser) setShowOnboarding(true);
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
  const goal = localStorage.getItem("ayuzee_goal");
  const goalMessages: Record<string, { icon: string; text: string; cta: string; href: string }> = {
    find_doctor: { icon: "🩺", text: "Your next step: Book a consultation", cta: "Browse Doctors", href: "/doctors" },
    panchakarma: { icon: "🫙", text: "Find a certified Panchakarma therapist near you", cta: "Browse Therapists", href: "/therapist/browse" },
    medicines: { icon: "💊", text: "Shop authentic Ayurvedic medicines", cta: "Go to Shop", href: "/shop" },
    prakriti: { icon: "🧬", text: "Discover your Ayurvedic body type in 5 minutes", cta: "Take Quiz", href: "/diagnosis/prakriti" },
    condition: { icon: "💪", text: "Find doctors specialised in your health condition", cta: "Find Specialists", href: "/doctors" },
    student: { icon: "🎓", text: "Your student hub is ready", cta: "Go to Student Hub", href: "/student" },
  };
  const goalInfo = goal ? goalMessages[goal] : null;

  const tiles = [
    { icon: Calendar, label: "Appointments", desc: "Upcoming consultations", count: upcoming.length },
    { icon: FileText, label: "Prescriptions", desc: "Digital prescriptions", count: 0 },
    { icon: ShoppingBag, label: "Orders", desc: "Medicine & products", count: orderCount },
    { icon: Truck, label: "Track Order", desc: "Medicine delivery status", count: null, href: "/shop/track" },
    { icon: Stethoscope, label: "Symptom Checker", desc: "AI-guided AYUSH triage", count: null, href: "/diagnosis/symptoms" },
    { icon: Heart, label: "Health Profile", desc: "Your wellness details", count: null },
  ];

  return (
    <div>
      {showOnboarding && userId && <PatientOnboarding userId={userId} onComplete={() => setShowOnboarding(false)} />}
      <main>

        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Dashboard</span>
          <h1 className="mt-2 font-display text-4xl">Namaste, {loading ? "…" : firstName} 🙏</h1>
          <p className="mt-2 text-muted-foreground">{email}</p>
          {goalInfo && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-foreground">{goalInfo.icon} {goalInfo.text}</p>
              <Button asChild variant="hero" size="sm"><Link to={goalInfo.href}>{goalInfo.cta} →</Link></Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => {
            const content = <><div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition-smooth group-hover:gradient-leaf group-hover:text-primary-foreground"><t.icon className="h-6 w-6" /></div><h3 className="text-lg font-semibold">{t.label}</h3><p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>{t.count !== null && <p className="mt-4 font-display text-3xl">{t.count}</p>}</>;
            return t.href ? <Link key={t.label} to={t.href} className="group rounded-2xl border border-border bg-card p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant">{content}</Link> : (
            <article key={t.label} className="group rounded-2xl border border-border bg-card p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              {content}
            </article>
          );})}
        </div>

        {userId && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <WellnessScore userId={userId} />
            <VitalsTracker userId={userId} />
          </section>
        )}

        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl">Upcoming appointments</h2>
            <Button asChild variant="outline" size="sm"><Link to="/doctors">Book another</Link></Button>
          </div>

          {(() => {
            const needsPreForm = upcoming.filter((a) => a.mode === "video" && !a.pre_form_submitted);
            if (needsPreForm.length === 0) return null;
            return (
              <div className="mb-4 space-y-2">
                {needsPreForm.map((a) => (
                  <Link
                    key={a.id}
                    to={`/consultation/${a.id}/pre-form`}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 transition-smooth hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-2xl">📋</div>
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-200">
                          Fill Pre-Consultation Form
                        </p>
                        <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                          Required before joining your video call with {a.doctors?.full_name ?? "your doctor"} on{" "}
                          {new Date(a.appointment_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {a.time_slot}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="hero" className="shrink-0">
                      Fill now →
                    </Button>
                  </Link>
                ))}
              </div>
            );
          })()}

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

        <section className="mt-12">
          <Link
            to="/referral"
            className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 gradient-soft p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-leaf text-primary-foreground">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl">Refer & Earn</h3>
                <p className="text-sm text-muted-foreground">Invite friends — earn 5% Ayuzee Money on every medicine purchase they make.</p>
              </div>
            </div>
            <Button variant="hero">Get your link</Button>
          </Link>
        </section>

        <HomeopathyCard userEmail={email} />

        {userId && <PatientTherapyPlans userId={userId} />}

        {userId && <SwasthavrittaPlanCard userId={userId} />}

        <section className="mt-8">
          <PrakritiHistory />
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
