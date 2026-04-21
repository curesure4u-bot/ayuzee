import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Info,
  Sparkles,
  GraduationCap,
  Mic2,
  PenSquare,
  Users,
  TrendingUp,
  Gift,
  Megaphone,
  Award,
  ArrowRight,
} from "lucide-react";

interface DoctorGrowthProps {
  scheduled?: number;
  consulted?: number;
  completedSteps?: number; // 0-7 — how many ladder rungs unlocked
}

const LADDER = [
  { label: "Free Digital Profile", desc: "Your verified Ayuzee profile" },
  { label: "Free PMS", desc: "Patient Management Suite access" },
  { label: "Video Consultation", desc: "Telehealth tools enabled" },
  { label: "Digital Content", desc: "Blogs & feed authoring" },
  { label: "Free Medicine Samples", desc: "Brand-sponsored samples" },
  { label: "In-Clinic Consultation", desc: "Listed as in-clinic doctor" },
  { label: "Profile Marketing", desc: "Featured across Ayuzee" },
];

const OPPORTUNITIES = [
  {
    icon: GraduationCap,
    title: "Teach a Course",
    desc: "Publish a CME-style course on Ayuzee Learning.",
    cta: "Submit a course",
    href: "/doctor/blogs",
    accent: "from-primary to-primary/70",
  },
  {
    icon: Mic2,
    title: "Host a Webinar",
    desc: "Connect with thousands of patients & peers live.",
    cta: "Apply to host",
    href: "/doctor/blogs",
    accent: "from-secondary to-secondary/70",
  },
  {
    icon: PenSquare,
    title: "Write Health Blogs",
    desc: "Build authority. Top blogs are promoted weekly.",
    cta: "Start writing",
    href: "/doctor/blogs",
    accent: "from-accent to-primary/60",
  },
  {
    icon: Users,
    title: "Refer a Doctor",
    desc: "Earn ₹1,000 in Ayuzee Money per approved referral.",
    cta: "Invite peers",
    href: "/doctor/about-partner",
    accent: "from-primary/80 to-secondary/60",
  },
  {
    icon: TrendingUp,
    title: "Bulk Medicines",
    desc: "Better margins on every patient order.",
    cta: "View catalog",
    href: "/doctor/medicines",
    accent: "from-secondary/80 to-primary/60",
  },
  {
    icon: Gift,
    title: "Reward Schemes",
    desc: "Hit monthly targets to unlock exclusive rewards.",
    cta: "See rewards",
    href: "/doctor/rewards",
    accent: "from-primary to-secondary/70",
  },
  {
    icon: Megaphone,
    title: "Featured Doctor",
    desc: "Get promoted on the Find Doctors hub & home page.",
    cta: "Boost profile",
    href: "/doctor",
    accent: "from-secondary to-primary/60",
  },
  {
    icon: Award,
    title: "Vaidya Tier Upgrade",
    desc: "Climb to Platinum / Diamond for higher payouts.",
    cta: "View tiers",
    href: "/doctor/category",
    accent: "from-accent to-secondary/60",
  },
];

export const DoctorGrowth = ({ scheduled = 0, consulted = 0, completedSteps = 3 }: DoctorGrowthProps) => {
  return (
    <div className="space-y-6">
      {/* Ladder + consultations */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Your Ayuzee Partner Progress</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Place orders in the Ayuzee Partner Program and unlock exciting rewards.
              </p>
            </div>
            <Sparkles className="h-5 w-5 shrink-0 text-secondary" />
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center gap-1.5 text-sm font-semibold">
              Rewards Earned
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            {/* Ladder */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
                {LADDER.map((step, i) => {
                  const done = i < completedSteps;
                  const next = i === completedSteps;
                  return (
                    <div key={step.label} className="relative flex flex-col items-center text-center">
                      {/* Connector line */}
                      {i < LADDER.length - 1 && (
                        <span
                          className={`pointer-events-none absolute left-1/2 top-4 hidden h-0.5 w-full lg:block ${
                            done ? "bg-primary" : "bg-border"
                          }`}
                          aria-hidden
                        />
                      )}
                      <span
                        className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border-2 ${
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : next
                              ? "border-primary bg-background text-primary animate-pulse"
                              : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-3 w-3" />}
                      </span>
                      <p className={`mt-2 text-xs font-semibold leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="mt-0.5 hidden text-[10px] leading-tight text-muted-foreground sm:block">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="hero" asChild>
                <Link to="/doctor/medicines">
                  Place Order <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                {completedSteps}/{LADDER.length} milestones unlocked
              </p>
            </div>
          </div>
        </Card>

        {/* Patient consultations */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <h3 className="font-display text-lg">Patient Consultations</h3>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Scheduled</span>
              <span className="font-display text-2xl text-foreground">{scheduled}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Consulted</span>
              <span className="font-display text-2xl text-foreground">{consulted}</span>
            </div>
          </div>
          <Button variant="outline" className="mt-5 w-full" asChild>
            <Link to="/doctor/appointments">
              <Calendar className="h-4 w-4" /> Apt Calendar
            </Link>
          </Button>
        </Card>
      </div>

      {/* Growth opportunities */}
      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Growth Opportunities</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              More ways to grow your practice, reputation, and earnings on Ayuzee.
            </p>
          </div>
          <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            New
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPPORTUNITIES.map((o) => (
            <Link
              key={o.title}
              to={o.href}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${o.accent} p-4 text-primary-foreground shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant`}
            >
              <o.icon className="h-7 w-7 opacity-95" />
              <h3 className="mt-4 font-display text-base leading-tight">{o.title}</h3>
              <p className="mt-1 text-xs opacity-90">{o.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                {o.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};
