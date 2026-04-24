import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, HandHelping, Package, Stethoscope, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  { icon: UserCircle, iconClass: "text-info", border: "border-l-info", bg: "bg-info/5", title: "I'm a Patient", body: "Book doctors, track therapies, get medicines delivered", buttons: [["Sign Up Free", "/auth?mode=signup"], ["Learn More", "/doctors"]] },
  { icon: Stethoscope, iconClass: "text-primary", border: "border-l-primary", bg: "bg-primary/5", title: "I'm a Doctor / Vaidya", body: "Manage patients, earn commissions, grow your practice", buttons: [["Join as Doctor", "/doctor/auth"], ["See Benefits", "/doctor/auth"]] },
  { icon: HandHelping, iconClass: "text-secondary", border: "border-l-secondary", bg: "bg-secondary/5", title: "I'm a Therapist", body: "Accept verified Panchakarma sessions. Earn ₹20,000+/week", buttons: [["Register Now", "/therapist/auth"], ["How it works", "/therapist/browse"]] },
  { icon: Building2, iconClass: "text-mystic", border: "border-l-mystic", bg: "bg-mystic/5", title: "Hospital / Resort / Clinic", body: "List your Panchakarma rooms. Earn room rental revenue.", buttons: [["List Your Venue", "/venue/auth"], ["See Revenue Model", "/venue/auth"]] },
  { icon: GraduationCap, iconClass: "text-earth", border: "border-l-earth", bg: "bg-earth/5", title: "I'm an Ayurveda Student", body: "Courses, CME, research, job board — your career hub", buttons: [["Join Student Hub", "/student/auth"], ["Browse Courses", "/learning/courses"]] },
  { icon: Package, iconClass: "text-warning", border: "border-l-warning", bg: "gradient-warm", title: "Pharma / Manufacturer", body: "List your AYUSH products. Reach 50,000+ patients and 10,000+ doctors.", buttons: [["Partner With Us", "/partner/apply?type=pharma"], ["See Plans", "/partner"]] },
];

const states = ["Tamil Nadu", "Kerala", "Karnataka", "Maharashtra", "Delhi", "Rajasthan", "UP", "West Bengal", "All 28 states"];

export const CTA = () => (
  <section className="container py-20">
    <div className="mb-12 text-center">
      <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary">🌿 Join Ayuzee</span>
      <h2 className="mx-auto mt-4 max-w-4xl font-display text-3xl leading-tight md:text-5xl">
        One platform. Six ways to be part of India's AYUSH revolution.
      </h2>
    </div>

    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className={`flex min-h-[260px] flex-col rounded-2xl border border-border border-l-4 ${card.border} ${card.bg} p-5 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant`}>
          <card.icon className={`h-10 w-10 ${card.iconClass}`} />
          <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{card.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{card.body}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="hero"><Link to={card.buttons[0][1]}>{card.buttons[0][0]}</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to={card.buttons[1][1]}>{card.buttons[1][0]}</Link></Button>
          </div>
        </article>
      ))}
    </div>

    <div className="mt-10 rounded-2xl bg-primary p-6 text-center text-primary-foreground shadow-elegant">
      <p className="font-semibold">🇮🇳 Proudly serving pan-India</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {states.map((state) => <span key={state} className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">{state}</span>)}
      </div>
    </div>
  </section>
);
