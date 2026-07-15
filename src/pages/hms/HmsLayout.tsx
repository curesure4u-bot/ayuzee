import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHmsAccess } from "@/hooks/useHmsAccess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2,
  LogOut,
  Users,
  CalendarClock,
  ClipboardList,
  ReceiptText,
  Activity,
  BarChart3,
  Home,
  Pill,
  BedDouble,
  FlaskConical,
  UserCog,
  Settings,
  Syringe,
  ChevronRight,
  Zap,
  Menu,
  X,
  Leaf,
  Heart,
  Droplets,
  Moon,
  Dumbbell,
  Sparkles,
  FileText,
  Package,
  Factory,
  Warehouse,
  Wallet,
  GraduationCap,
  Globe,
  Smartphone,
  Brain,
  Stethoscope,
  ScanLine,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    icon: Home,
    items: [
      { to: "/hms", label: "Dashboard", icon: Home },
    ],
  },
  {
    label: "Front Office",
    icon: Activity,
    items: [
      { to: "/hms/opd", label: "OPD Queue & Tokens", icon: Activity },
      { to: "/hms/appointments", label: "Appointments", icon: CalendarClock },
      { to: "/hms/online-booking", label: "Online Booking", icon: Globe },
      { to: "/hms/waitlist", label: "Waitlist", icon: Users },
      { to: "/hms/patients", label: "Patient Registry", icon: Users },
      { to: "/hms/teleconsult", label: "Teleconsultation", icon: Smartphone },
    ],
  },
  {
    label: "In-Patient",
    icon: BedDouble,
    items: [
      { to: "/hms/ipd", label: "IPD & Wards", icon: BedDouble },
      { to: "/hms/nursing", label: "Nursing Station", icon: Heart },
      { to: "/hms/diet-kitchen", label: "Diet & Kitchen", icon: Leaf },
    ],
  },
  {
    label: "Clinical",
    icon: ClipboardList,
    items: [
      { to: "/hms/emr", label: "EMR & Records", icon: FileText },
      { to: "/hms/consultations", label: "Consultations", icon: ClipboardList },
      { to: "/hms/lab", label: "Lab & Diagnostics", icon: FlaskConical },
      { to: "/hms/radiology", label: "Radiology", icon: ScanLine },
      { to: "/hms/pharmacy", label: "Pharmacy", icon: Pill },
      { to: "/hms/e-prescription", label: "E-Prescription", icon: FileText },
      { to: "/hms/icd-coding", label: "ICD Codes (AYUSH)", icon: ClipboardList },
      { to: "/hms/namaste-coding", label: "NAMASTE / TM2", icon: ClipboardList },
      { to: "/hms/treatment-timeline", label: "8-Phase Timeline", icon: Activity },
      { to: "/hms/outcome-scales", label: "Outcome Scales", icon: Activity },
      { to: "/hms/proms", label: "Patient Outcomes", icon: Heart },
      { to: "/hms/treatment-view", label: "Live Treatment View", icon: Activity },
      { to: "/diagnosis/gut-health", label: "Gut Health Assessment", icon: Heart },
      { to: "/hms/ot", label: "Operation Theater", icon: Syringe },
      { to: "/hms/blood-bank", label: "Blood Bank", icon: Droplets },
      { to: "/hms/procedures", label: "Procedures", icon: Syringe },
    ],
  },
  {
    label: "AYUSH Clinical",
    icon: Leaf,
    items: [
      { to: "/hms/ayurveda", label: "Ayurveda", icon: Leaf },
      { to: "/hms/siddha", label: "Siddha", icon: Droplets },
      { to: "/hms/homeopathy", label: "Homeopathy", icon: Heart },
      { to: "/hms/unani", label: "Unani", icon: Moon },
      { to: "/hms/yoga", label: "Yoga & Naturopathy", icon: Dumbbell },
    ],
  },
  {
    label: "Panchakarma",
    icon: Sparkles,
    items: [
      { to: "/hms/panchakarma", label: "Treatment Dashboard", icon: Sparkles },
      { to: "/hms/panchakarma/schedule", label: "Therapy Schedule", icon: CalendarClock },
      { to: "/hms/panchakarma/packages", label: "Packages & Plans", icon: Package },
      { to: "/hms/pk-consent", label: "Consent & Docs", icon: FileText },
    ],
  },
  {
    label: "Manufacturing",
    icon: Factory,
    items: [
      { to: "/hms/manufacturing", label: "Manufacturing Unit", icon: Factory },
    ],
  },
  {
    label: "Finance",
    icon: ReceiptText,
    items: [
      { to: "/hms/billing", label: "Billing & Invoices", icon: ReceiptText },
      { to: "/hms/billing/insurance", label: "Insurance Claims", icon: Wallet },
    ],
  },
  {
    label: "Inventory & Stores",
    icon: Warehouse,
    items: [
      { to: "/hms/inventory", label: "Inventory Management", icon: Warehouse },
      { to: "/hms/indent", label: "Indent & Stock Audit", icon: ClipboardList },
      { to: "/hms/assets", label: "Assets & Equipment", icon: Stethoscope },
    ],
  },
  {
    label: "AI & Intelligence",
    icon: Brain,
    items: [
      { to: "/hms/ai-assist", label: "AI Clinical Support", icon: Brain },
      { to: "/hms/ai-scribe", label: "AI Scribe", icon: Stethoscope },
      { to: "/hms/cdss", label: "CDSS Alerts", icon: Brain },
      { to: "/hms/conflict-detection", label: "Conflict Detection", icon: ScanLine },
      { to: "/hms/records-analyser", label: "Records Analyser", icon: ScanLine },
    ],
  },
  {
    label: "Digital Health",
    icon: Globe,
    items: [
      { to: "/hms/abdm", label: "ABDM Connect", icon: Globe },
      { to: "/hms/phr", label: "Patient Health Records", icon: Heart },
      { to: "/hms/whatsapp", label: "WhatsApp Engage", icon: Smartphone },
      { to: "/hms/feedback", label: "Feedback & NPS", icon: Heart },
      { to: "/hms/referral", label: "Referral Management", icon: Users },
      { to: "/hms/loyalty", label: "Loyalty Program", icon: Heart },
      { to: "/hms/command-center", label: "Command Center", icon: Building2 },
    ],
  },
  {
    label: "Administration",
    icon: UserCog,
    items: [
      { to: "/hms/hr", label: "HR & Payroll", icon: UserCog },
      { to: "/hms/shift-roster", label: "Shift Rostering", icon: CalendarClock },
      { to: "/hms/reports", label: "Analytics & MIS", icon: BarChart3 },
      { to: "/hms/nabh", label: "NABH Compliance", icon: Settings },
      { to: "/hms/audit-trail", label: "Audit Trail", icon: Settings },
      { to: "/hms/governance", label: "Governance Dashboard", icon: BarChart3 },
      { to: "/hms/ambulance", label: "Ambulance / EMS", icon: Globe },
      { to: "/hms/queue-display", label: "Queue TV Display", icon: Smartphone },
      { to: "/hms/masters", label: "Master Management", icon: Settings },
      { to: "/hms/developer", label: "Developer Portal", icon: Settings },
      { to: "/hms/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Research & Academic",
    icon: GraduationCap,
    items: [
      { to: "/hms/research", label: "Research Module", icon: GraduationCap },
    ],
  },
  {
    label: "Resort & Wellness",
    icon: Globe,
    items: [
      { to: "/hms/reservation", label: "Room Reservation", icon: CalendarClock },
      { to: "/hms/housekeeping", label: "Housekeeping & Laundry", icon: Sparkles },
      { to: "/hms/canteen", label: "Restaurant / Canteen", icon: Globe },
      { to: "/hms/maintenance", label: "Maintenance", icon: Settings },
      { to: "/hms/multi-currency", label: "Multi-Currency", icon: Globe },
    ],
  },
  {
    label: "Outreach",
    icon: Globe,
    items: [
      { to: "/hms/public-health", label: "Public Health", icon: Globe },
    ],
  },
];

const HmsLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasAccess, branch } = useHmsAccess();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/hms/auth", { replace: true });
        return;
      }
      if (mounted) setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/hms/auth", { replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/hms/auth");
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border shadow-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 flex flex-col border-r border-border bg-card
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="border-b border-border px-4 py-4">
          <Link to="/hms" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <p className="font-display text-base font-semibold">AYUSH HMS</p>
              <p className="text-[10px] text-muted-foreground">
                {branch ?? "AI-Powered AYUSH ERP"}
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {navGroups.map((g) => (
            <div key={g.label} className="mb-4">
              <div className="mb-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <g.icon className="h-3.5 w-3.5" />
                {g.label}
              </div>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/hms"}
                  onClick={() => setSidebarOpen(false)}
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

        <div className="border-t border-border p-3 space-y-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/vaidya">Switch to Vaidya Clinical</Link>
          </Button>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/vaidya/hms">HMS Ultra Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3 ml-12 md:ml-0">
            <h1 className="font-display text-lg font-semibold">AYUSH Hospital Management System</h1>
            {hasAccess && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <Zap className="mr-1 h-3 w-3" /> Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{branch}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HmsLayout;
