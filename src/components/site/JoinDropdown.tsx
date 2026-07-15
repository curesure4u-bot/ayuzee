import { useState } from "react";
import { Building2, GraduationCap, HandHelping, Package, Stethoscope, UserCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const roles = [
  {
    title: "I'm a Patient",
    subtitle: "Book consultations, buy medicines, track therapies",
    icon: UserCircle,
    login: "/auth?role=patient",
    signup: "/auth?mode=signup&role=patient",
    tone: "border-l-primary text-primary bg-primary/10",
  },
  {
    title: "I'm a Doctor / Vaidya",
    subtitle: "Manage patients, prescribe, earn commissions",
    icon: Stethoscope,
    login: "/doctor/auth",
    signup: "/doctor/auth?mode=signup",
    tone: "border-l-secondary text-secondary bg-secondary/10",
  },
  {
    title: "I'm a Therapist",
    subtitle: "Accept Panchakarma sessions, track earnings",
    icon: HandHelping,
    login: "/therapist/auth",
    signup: "/therapist/auth?mode=signup",
    tone: "border-l-accent text-accent-foreground bg-accent/60",
  },
  {
    title: "I'm a Service Provider",
    subtitle: "List your therapy rooms, manage bookings, earn revenue",
    icon: Building2,
    login: "/venue/auth",
    signup: "/venue/auth?mode=signup",
    tone: "border-l-ring text-ring bg-ring/10",
  },
  {
    title: "I'm an Ayurveda Student",
    subtitle: "Access courses, research papers, job listings, and CME programs",
    icon: GraduationCap,
    login: "/student/auth",
    signup: "/student/auth?mode=signup",
    tone: "border-l-muted-foreground text-muted-foreground bg-muted/70",
  },
  {
    title: "Pharma / Manufacturer",
    subtitle: "List AYUSH products. Reach 50,000+ patients & 10,000+ doctors",
    icon: Package,
    login: "/partner/apply?type=pharma",
    signup: "/partner/apply?type=pharma",
    tone: "border-l-amber-500 text-amber-700 bg-amber-50",
  },
  {
    title: "AYUSH HMS Portal",
    subtitle: "Full hospital management — OPD, IPD, Pharmacy, Panchakarma, AI tools, Billing & 70+ modules",
    icon: Zap,
    login: "/hms/auth",
    signup: "/hms/auth?mode=signup",
    tone: "border-l-violet-500 text-violet-700 bg-violet-50",
    wide: true,
  },
];

export const JoinRoleCards = ({ onSelect }: { onSelect?: () => void }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {roles.map((role) => (
      <div
        key={role.title}
        className={cn(
          "rounded-xl border border-border border-l-4 bg-card p-4 transition-smooth hover:-translate-y-0.5 hover:shadow-lg",
          role.tone,
          role.wide && "sm:col-span-2",
        )}
      >
        <div className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-background/80">
            <role.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground">{role.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{role.subtitle}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button asChild size="sm" variant="outline" onClick={onSelect}>
            <Link to={role.login}>Login</Link>
          </Button>
          <Button asChild size="sm" variant="hero" onClick={onSelect}>
            <Link to={role.signup}>Sign up</Link>
          </Button>
        </div>
      </div>
    ))}
  </div>
);

export const JoinDropdown = () => {
  const [open, setOpen] = useState(false);

  return (
  <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger asChild>
      <Button variant="hero" className="hidden gap-1 rounded-full px-5 sm:inline-flex">
        Join Ayuzee ▾
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-[520px] max-w-[calc(100vw-2rem)] p-4">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold">Choose your role</h2>
        <p className="text-sm text-muted-foreground">Select how you want to use Ayuzee.</p>
      </div>
      <JoinRoleCards onSelect={() => setOpen(false)} />
    </DropdownMenuContent>
  </DropdownMenu>
  );
};