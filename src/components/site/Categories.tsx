import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, ChevronRight, HandHelping, ShoppingBag, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: "🩺", target: 10000, label: "AYUSH Doctors", suffix: "+" },
  { icon: "🤲", target: 500, label: "Certified Therapists", suffix: "+" },
  { icon: "👥", target: 50000, label: "Patients Served", suffix: "+" },
  { icon: "💊", target: 5000, label: "Authentic Products", suffix: "+" },
  { icon: "🏥", target: 200, label: "Partner Venues", suffix: "+" },
  { icon: "🌟", target: 4.9, label: "Average Rating", suffix: "/5" },
];

const patientSteps = [
  {
    eyebrow: "🧬 Know Your Dosha",
    icon: Brain,
    title: "Take Prakriti Quiz",
    desc: "5-min AI quiz reveals your Ayurvedic body type (Vata/Pitta/Kapha) and health risks",
    cta: "Start quiz →",
    href: "/diagnosis/prakriti",
    badge: "Powered by AI",
  },
  {
    eyebrow: "🩺 Find Your Doctor",
    icon: Stethoscope,
    title: "Book AYUSH Doctor",
    desc: "Choose from 10,000+ verified Ayurveda, Homeopathy, Siddha, and Unani doctors near you",
    cta: "Find doctor →",
    href: "/doctors",
    badge: "10,000+ Doctors",
  },
  {
    eyebrow: "🫙 Get Therapy",
    icon: HandHelping,
    title: "Book Panchakarma",
    desc: "Doctor prescribes → you choose a GPS-tracked certified therapist + nearby therapy room",
    cta: "Browse therapists →",
    href: "/therapist/browse",
    badge: "🗺️ GPS Tracked",
  },
  {
    eyebrow: "💊 Get Medicines",
    icon: ShoppingBag,
    title: "Medicines Delivered",
    desc: "Authentic Ayurvedic medicines prescribed by your doctor delivered to your door",
    cta: "Shop now →",
    href: "/shop",
    badge: "Free delivery ₹999+",
  },
];

const doctorSteps = [
  {
    eyebrow: "✍️ Register & Verify",
    icon: Stethoscope,
    title: "Upload Credentials",
    desc: "Upload certificates, get verified in 24-48hrs",
    badge: "Fast approval",
  },
  {
    eyebrow: "👥 See Patients",
    icon: Brain,
    title: "Consult Online",
    desc: "Video/in-clinic consultations, digital prescriptions",
    badge: "Hybrid practice",
  },
  {
    eyebrow: "💰 Earn Commission",
    icon: ShoppingBag,
    title: "Grow Revenue",
    desc: "Earn on medicines, therapy referrals, and bulk orders",
    badge: "More earnings",
  },
  {
    eyebrow: "📚 Grow Skills",
    icon: HandHelping,
    title: "Keep Learning",
    desc: "CME webinars, courses, quizzes, certificates",
    badge: "Certified CME",
  },
];

export const Categories = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [audience, setAudience] = useState<"patients" | "doctors">("patients");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const duration = 2000;
        const intervalMs = 40;
        const steps = duration / intervalMs;
        let tick = 0;

        const interval = window.setInterval(() => {
          tick += 1;
          const progress = Math.min(tick / steps, 1);
          setCounts(stats.map((stat) => stat.target * progress));

          if (progress === 1) window.clearInterval(interval);
        }, intervalMs);
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const currentSteps = audience === "patients" ? patientSteps : doctorSteps;

  return (
    <>
      <section ref={sectionRef} className="border-y border-border bg-card py-10">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl" aria-hidden="true">
                {stat.icon}
              </div>
              <div className="mt-2 font-display text-4xl font-bold text-primary">
                {stat.suffix === "/5" ? counts[index].toFixed(1) : Math.floor(counts[index]).toLocaleString("en-IN")}
                {stat.suffix}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
              🚀 The Platform
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl">India's only end-to-end AYUSH platform</h2>
            <p className="mt-3 text-muted-foreground">
              From diagnosis to doctor to therapy to medicines — everything connected.
            </p>
          </div>

          <div className="flex w-fit rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setAudience("patients")}
              className={
                audience === "patients"
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  : "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              }
            >
              For Patients
            </button>
            <button
              type="button"
              onClick={() => setAudience("doctors")}
              className={
                audience === "doctors"
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  : "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              }
            >
              For Doctors
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {currentSteps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-primary/20 bg-accent px-2.5 py-1 text-xs font-medium text-primary">
                    {step.badge}
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{step.eyebrow}</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
                {"href" in step && "cta" in step && (
                  <Link to={step.href} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                    {step.cta}
                  </Link>
                )}
              </div>
              {index < currentSteps.length - 1 && (
                <ChevronRight className="absolute -right-4 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-background text-primary md:block" />
              )}
            </div>
          ))}
        </div>

        {audience === "patients" ? (
          <div className="mt-8 rounded-2xl border border-primary/20 bg-accent px-5 py-4 text-sm font-medium text-primary">
            💡 Unlike NirogStreet or 1mg — Ayuzee is the ONLY platform that connects your doctor's prescription directly to a verified therapist AND your medicine delivery in one workflow.
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-accent px-5 py-4 text-primary sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Join 10,000+ AYUSH doctors already on Ayuzee</p>
            <Button variant="hero" asChild>
              <Link to="/doctor/auth">Join Ayuzee</Link>
            </Button>
          </div>
        )}
      </section>
    </>
  );
};
