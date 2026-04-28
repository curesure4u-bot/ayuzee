import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  LogOut,
  Users,
  ClipboardList,
  CalendarClock,
  PhoneCall,
  Boxes,
  ReceiptText,
  HeartHandshake,
  Sparkles,
  ChevronRight,
  Code2,
  Pill,
  Flower2,
  Activity,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const groups = [
  {
    label: "Reception",
    icon: Activity,
    items: [
      { to: "/vaidya/reception", label: "Queue & Tokens", icon: Activity },
    ],
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    items: [
      { to: "/vaidya/analytics", label: "Practice Analytics", icon: TrendingUp },
    ],
  },
  {
    label: "My Patients",
    icon: Users,
    items: [
      { to: "/vaidya/consultations", label: "My Consultation", icon: ClipboardList },
      { to: "/vaidya/ayurveda-prescription", label: "Ayurveda Prescription", icon: Pill },
      { to: "/vaidya/siddha-prescription", label: "Siddha Prescription", icon: Pill },
      { to: "/vaidya/unani-prescription", label: "Unani Prescription", icon: Pill },
      { to: "/vaidya/homeopathy-prescription", label: "Homeopathy Prescription", icon: Pill },
      { to: "/vaidya/patients", label: "All Patients", icon: Users },
      { to: "/vaidya/follow-up", label: "Follow up list", icon: CalendarClock },
      { to: "/vaidya/upcoming", label: "Upcoming Appointment", icon: CalendarClock },
      { to: "/vaidya/leads", label: "Ayuzee Leads", icon: PhoneCall },
    ],
  },
  {
    label: "Inventory",
    icon: Boxes,
    items: [{ to: "/vaidya/inventory", label: "Stock", icon: Boxes }],
  },
  {
    label: "Invoices",
    icon: ReceiptText,
    items: [
      { to: "/vaidya/bills", label: "All Bills", icon: ReceiptText },
      { to: "/vaidya/direct-selling", label: "Direct Selling", icon: ReceiptText },
    ],
  },
  {
    label: "Network & Therapy",
    icon: HeartHandshake,
    items: [
      { to: "/vaidya/network", label: "Partner Network", icon: HeartHandshake },
      { to: "/vaidya/therapy-plans", label: "Therapy Plans", icon: Sparkles },
      { to: "/vaidya/therapy-catalog", label: "Ayush Therapy Catalog", icon: Sparkles },
    ],
  },
  {
    label: "Diagnosis",
    icon: Sparkles,
    items: [
      { to: "/vaidya/prakriti", label: "Prakriti Pareeksha", icon: Sparkles },
      { to: "/vaidya/ashtavidha", label: "Ashtavidha Pariksha", icon: Sparkles },
    ],
  },
  {
    label: "Panchakarma",
    icon: Flower2,
    items: [
      { to: "/vaidya/panchakarma", label: "Panchakarma Planner", icon: Flower2 },
    ],
  },
  {
    label: "Posture AI",
    icon: Activity,
    items: [
      { to: "/vaidya/posture", label: "Posture Screening", icon: Activity },
    ],
  },
  {
    label: "Yoga Therapy AI",
    icon: Flower2,
    items: [
      { to: "/vaidya/yoga", label: "Yoga Dashboard", icon: Flower2 },
      { to: "/vaidya/yoga/assessment/new", label: "New Yoga Assessment", icon: Flower2 },
      { to: "/vaidya/yoga/plans", label: "Patient Yoga Plans", icon: Flower2 },
      { to: "/vaidya/yoga/protocols", label: "Condition Protocols", icon: Flower2 },
      { to: "/vaidya/yoga/progress", label: "Progress Tracker", icon: Flower2 },
    ],
  },
  {
    label: "Developer",
    icon: Code2,
    items: [
      { to: "/vaidya/developer", label: "API Keys", icon: Code2 },
    ],
  },
];

const VaidyaLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/doctor/auth", { replace: true });
        return;
      }
      if (mounted) setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/doctor/auth", { replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/doctor/auth");
  };

  if (checking) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full gradient-leaf">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <p className="font-display text-base font-semibold">Ayush HMS Tool</p>
              <p className="text-[10px] text-muted-foreground">Hospital Mgmt System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map((g) => (
            <div key={g.label} className="mb-4">
              <div className="mb-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <g.icon className="h-3.5 w-3.5" />
                {g.label}
              </div>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground/80 hover:bg-muted/50"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/doctor">← Back to Doctor</Link>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between border-b border-border bg-card px-4">
          <p className="font-display text-lg font-semibold">Ayush HMS Tool</p>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VaidyaLayout;
