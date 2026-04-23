import { useState } from "react";
import { Leaf, ShoppingCart, Menu, X, ChevronDown, UserCircle, Stethoscope, HeartPulse, Building2, Handshake, CalendarCheck, Search, MapPin, Newspaper, Pill, Sparkles, Activity, GraduationCap, BookOpen, Briefcase, Tag, ChevronRight } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { MedicineMenu } from "@/components/site/MedicineMenu";
import { TreatmentsMenu } from "@/components/site/TreatmentsMenu";
import { PatientProfileMenu } from "@/components/site/PatientProfileMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const primaryLinks = [
  { to: "/login", label: "Book Appointment", icon: CalendarCheck },
  { to: "/doctors", label: "Find Doctors", icon: Search },
  { to: "/clinics", label: "Find Clinics", icon: MapPin },
  { to: "/feed", label: "Feed", icon: Newspaper },
];

const tailLinks = [
  { to: "/therapies", label: "Therapies", icon: Activity },
  { to: "/learning/courses", label: "Learning", icon: GraduationCap },
  { to: "/learning/blogs", label: "Blogs", icon: BookOpen },
  { to: "/partner", label: "Job Portal", icon: Briefcase },
];

const mobileExtraLinks = [
  { to: "/shop", label: "Buy Medicine", icon: Pill },
  { to: "/treatments/ayurveda", label: "Treatments", icon: Sparkles },
  { to: "/offers", label: "Offers", icon: Tag },
];

const signInRoles = [
  { to: "/auth", label: "Patient", desc: "Book consults & order medicines", icon: HeartPulse },
  { to: "/doctor/auth", label: "Doctor / Vaidya", desc: "Manage practice & patients", icon: Stethoscope },
  { to: "/provider/auth", label: "Therapist / Service Provider", desc: "Offer therapies & services", icon: UserCircle },
  { to: "/partner/apply", label: "Hospital / Clinic", desc: "Join the Ayuzee network", icon: Building2 },
  { to: "/partner", label: "Collaborator / Partner", desc: "Bulk, B2B & affiliations", icon: Handshake },
];

export const SiteNav = () => {
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap transition-smooth hover:text-primary ${
      isActive ? "text-primary" : "text-foreground/80"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf shadow-soft">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">Ayuzee</span>
        </Link>

        {/* Primary nav (desktop) */}
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-7">
          {primaryLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
          <MedicineMenu />
          <TreatmentsMenu />
          {tailLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/offers"
            className={({ isActive }) =>
              `inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-soft transition-smooth hover:opacity-90 ${
                isActive ? "ring-2 ring-secondary/50" : ""
              }`
            }
          >
            Offers
          </NavLink>
        </nav>

        {/* Right: Cart + Sign in / Profile */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {authed ? (
            <PatientProfileMenu />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hero" className="hidden gap-1 rounded-full px-5 sm:inline-flex">
                  Sign in <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                  Sign in as
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {signInRoles.map((r) => (
                  <DropdownMenuItem key={r.to} asChild>
                    <Link to={r.to} className="flex cursor-pointer items-start gap-3 py-2">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <r.icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.desc}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/login" className="cursor-pointer text-center text-xs font-medium text-primary">
                    See all login options →
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Browse
            </p>
            {[...primaryLinks, ...tailLinks, ...mobileExtraLinks].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 text-sm font-medium transition-smooth hover:border-primary/40 hover:bg-primary/5 ${
                    isActive ? "border-primary/50 bg-primary/10 text-primary" : "text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <l.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{l.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </NavLink>
            ))}

            {!authed && (
              <div className="mt-4 space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sign in as
                </p>
                {signInRoles.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-smooth hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-semibold">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.desc}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
