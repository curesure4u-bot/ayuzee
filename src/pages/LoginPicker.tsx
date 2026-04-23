import { Link } from "react-router-dom";
import { Leaf, User, Stethoscope, Building2, ShieldCheck, ArrowRight } from "lucide-react";

const choices = [
  {
    to: "/auth",
    title: "Patient / Individual",
    description: "Book consultations, order medicines, and track your wellness journey.",
    icon: User,
    accent: "from-emerald-500/15 to-emerald-500/5 text-emerald-700",
  },
  {
    to: "/doctor/auth",
    title: "Doctor / Chemist / Student / Retailer",
    description: "Grow your Ayurvedic practice, manage patients, and access bulk pricing.",
    icon: Stethoscope,
    accent: "from-primary/15 to-primary/5 text-primary",
  },
  {
    to: "/provider/auth",
    title: "Hospital / Therapist / Panchakarma / Resort",
    description: "List your facility, accept bookings, and reach more patients across India.",
    icon: Building2,
    accent: "from-amber-500/15 to-amber-500/5 text-amber-700",
  },
  {
    to: "/admin/auth",
    title: "Admin / Super Admin",
    description: "Restricted area for Ayuzee staff to manage the platform.",
    icon: ShieldCheck,
    accent: "from-slate-500/15 to-slate-500/5 text-slate-700",
  },
];

const LoginPicker = () => {
  return (
    <div className="min-h-screen gradient-soft">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full gradient-leaf">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-semibold">Ayuzee</span>
        </Link>

        <h1 className="text-center font-display text-3xl md:text-4xl">Welcome to Ayuzee</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground md:text-base">
          Choose how you'd like to continue
        </p>

        <div className="mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {choices.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.accent}`}>
                <c.icon className="h-6 w-6" />
              </span>
              <h2 className="font-display text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          New to Ayuzee? Pick the role that best fits you and create your account on the next step.
        </p>
      </div>
    </div>
  );
};

export default LoginPicker;
