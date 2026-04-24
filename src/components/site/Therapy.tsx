import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, CreditCard, MapPin, Smartphone, Star, Stethoscope } from "lucide-react";

const flowSteps = [
  {
    icon: Stethoscope,
    emoji: "🩺",
    title: "Doctor Prescribes",
    desc: "Your AYUSH doctor recommends 14-day Janu Basti and lists required medicines",
    pill: "via Vaidya HMS",
    cardClass: "border-primary/30 bg-primary/5",
    iconClass: "text-primary",
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "You Pick Therapist + Venue",
    desc: "Browse verified therapists by gender, rating, certification. Pick a nearby therapy room.",
    pill: "Like booking Uber",
    cardClass: "border-info/40 bg-info/10",
    iconClass: "text-info",
  },
  {
    icon: CreditCard,
    emoji: "💳",
    title: "Secure Payment",
    desc: "Pay once via Razorpay. Revenue auto-split: therapist 65% · venue 20% · doctor 10% · Ayuzee 5%",
    pill: "Razorpay secured",
    cardClass: "border-warning/40 bg-warning/10",
    iconClass: "text-warning",
  },
  {
    icon: MapPin,
    emoji: "🗺️",
    title: "Track in Real Time",
    desc: "Patient tracks therapist arrival live. Session timer starts on arrival. Safety check built in.",
    pill: "🔴 LIVE tracking",
    cardClass: "border-secondary/40 bg-secondary/10",
    iconClass: "text-secondary",
    ping: true,
  },
  {
    icon: Star,
    emoji: "⭐",
    title: "Rate Your Session",
    desc: "Therapist completes session checklist. Patient rates. Auto-payout to all parties.",
    pill: "Auto revenue split",
    cardClass: "border-primary/30 bg-primary/5",
    iconClass: "text-primary",
  },
];

const safetyChips = [
  "🔒 Only certified therapists (verified certificate)",
  "🚫 No unauthorized therapies — hard-coded restriction",
  "⚠️ Auto-flag if session ends too early",
];

const therapists = [
  { initials: "NS", name: "Neha Sood", gender: "Female", city: "New Delhi", exp: "8 yrs", therapies: ["Kati Basti", "Shirodhara"], rating: "4.8" },
  { initials: "AK", name: "Arjun Kumar", gender: "Male", city: "Kochi", exp: "10 yrs", therapies: ["Abhyanga", "Janu Basti"], rating: "4.9" },
  { initials: "MR", name: "Meera Rao", gender: "Female", city: "Bengaluru", exp: "7 yrs", therapies: ["Pizhichil", "Nasya"], rating: "4.8" },
  { initials: "VP", name: "Vikram Patel", gender: "Male", city: "Pune", exp: "9 yrs", therapies: ["Udvartana", "Shirodhara"], rating: "4.7" },
];

export const Therapy = () => (
  <section className="py-24">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div className="max-w-3xl">
          <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
            🤲 Panchakarma Therapists
          </span>
          <h2 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
            Book certified therapists like ordering an Uber
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Doctor prescribes your therapy → you pick a GPS-tracked, certified therapist + a nearby Panchakarma room. All tracked. All verified.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
            500+ Certified Therapists
          </div>
          <div className="rounded-full border border-info/20 bg-info/10 px-4 py-2 text-sm font-semibold text-info">
            200+ Partner Venues
          </div>
          <Button variant="hero" asChild>
            <Link to="/therapist/browse">Browse Therapists</Link>
          </Button>
        </div>
      </div>

      <div className="my-12 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {flowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="contents">
              <article className={`h-full rounded-2xl border p-5 text-center shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant ${step.cardClass}`}>
                <div className="relative mx-auto mb-3 w-fit">
                  <Icon className={`h-10 w-10 ${step.iconClass}`} />
                  {step.ping && (
                    <span className="absolute right-0 top-0 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{step.emoji}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
                <span className="mt-4 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {step.pill}
                </span>
              </article>
              {index < flowSteps.length - 1 && <ChevronRight className="mx-auto hidden h-8 w-8 text-muted-foreground md:block" />}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {safetyChips.map((chip) => (
          <span key={chip} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft">
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
        {therapists.map((therapist) => (
          <article key={therapist.name} className="min-w-[260px] rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-leaf font-display text-lg text-primary-foreground">
                {therapist.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight text-foreground">{therapist.name}</h3>
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                    {therapist.gender}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{therapist.city} · {therapist.exp}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {therapist.therapies.map((therapy) => (
                <span key={therapy} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary">
                  {therapy}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">⭐ {therapist.rating} rating</p>
            <Button variant="hero" className="mt-4 w-full" asChild>
              <Link to="/therapist/browse">Book Session</Link>
            </Button>
          </article>
        ))}

        <Link
          to="/therapist/browse"
          className="flex min-w-[260px] items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center font-semibold text-primary transition-smooth hover:bg-primary/10"
        >
          View all 500+ therapists <ChevronRight className="ml-1 h-5 w-5" />
        </Link>
      </div>
    </div>
  </section>
);
