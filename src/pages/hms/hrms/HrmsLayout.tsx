import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Users, CalendarClock, Calendar, ClipboardList,
  IndianRupee, Award, Target, UserPlus, GraduationCap, BookOpen,
  FileText, MessageSquare, AlertTriangle, Package, Megaphone,
  FileSignature, LogOut as LogOutIcon, Settings, ChevronRight,
  ArrowLeft, Shield, BarChart3, Briefcase,
} from "lucide-react";
import { useHrmsPermissions, canAccessHrmsModule, type HrmsModule } from "@/hooks/hrms/useHrmsPermissions";

// ─── HRMS Sidebar Navigation ─────────────────────────────────────────────────

interface NavItem {
  divider?: string;
  to: string;
  label: string;
  icon: any;
  module: HrmsModule;
  badge?: string;
}

const hrmsNavItems: NavItem[] = [
  { divider: "Overview", to: "/hms/hrms", label: "HR Dashboard", icon: LayoutDashboard, module: "dashboard" },

  { divider: "People", to: "/hms/hrms/employees", label: "Employees", icon: Users, module: "employees" },
  { to: "/hms/hrms/recruitment", label: "Recruitment", icon: UserPlus, module: "recruitment" },
  { to: "/hms/hrms/onboarding", label: "Onboarding", icon: Briefcase, module: "onboarding" },

  { divider: "Workforce", to: "/hms/hrms/attendance", label: "Attendance", icon: CalendarClock, module: "attendance" },
  { to: "/hms/hrms/duty-roster", label: "Duty Roster", icon: Calendar, module: "duty_roster" },
  { to: "/hms/hrms/leave", label: "Leave Management", icon: ClipboardList, module: "leave" },

  { divider: "Compensation", to: "/hms/hrms/payroll", label: "Payroll & Salary", icon: IndianRupee, module: "payroll" },
  { to: "/hms/hrms/incentives", label: "Incentives", icon: Award, module: "incentives" },

  { divider: "Growth", to: "/hms/hrms/performance", label: "Performance & KPI", icon: Target, module: "performance" },
  { to: "/hms/hrms/training", label: "Training", icon: GraduationCap, module: "training" },

  { divider: "HR Operations", to: "/hms/hrms/documents", label: "Documents", icon: BookOpen, module: "documents" },
  { to: "/hms/hrms/requests", label: "Requests & Approvals", icon: MessageSquare, module: "requests" },
  { to: "/hms/hrms/letters", label: "HR Letters", icon: FileSignature, module: "letters" },
  { to: "/hms/hrms/announcements", label: "Announcements", icon: Megaphone, module: "announcements" },
  { to: "/hms/hrms/assets", label: "Assets", icon: Package, module: "assets" },
  { to: "/hms/hrms/disciplinary", label: "Disciplinary", icon: AlertTriangle, module: "disciplinary", badge: "restricted" },
  { to: "/hms/hrms/exit", label: "Exit Management", icon: LogOutIcon, module: "exit" },

  { divider: "Analytics", to: "/hms/hrms/reports", label: "Reports", icon: BarChart3, module: "reports" },

  { divider: "System", to: "/hms/hrms/settings", label: "HRMS Settings", icon: Settings, module: "settings" },
];

// ─── Employee Self-Service Items ─────────────────────────────────────────────

const essNavItems: NavItem[] = [
  { to: "/hms/hrms/ess", label: "My Dashboard", icon: LayoutDashboard, module: "ess" },
  { to: "/hms/hrms/ess/profile", label: "My Profile", icon: Users, module: "ess" },
  { to: "/hms/hrms/ess/attendance", label: "My Attendance", icon: CalendarClock, module: "ess" },
  { to: "/hms/hrms/ess/leave", label: "My Leave", icon: ClipboardList, module: "ess" },
  { to: "/hms/hrms/ess/payslips", label: "My Payslips", icon: IndianRupee, module: "ess" },
  { to: "/hms/hrms/ess/kpi", label: "My KPI", icon: Target, module: "ess" },
  { to: "/hms/hrms/ess/requests", label: "My Requests", icon: MessageSquare, module: "ess" },
];

// ─── Component ───────────────────────────────────────────────────────────────

const HrmsLayout = () => {
  const navigate = useNavigate();
  const permissions = useHrmsPermissions();

  // Determine which nav to show
  const isSelfServiceOnly = permissions.role === "employee";
  const navItems = isSelfServiceOnly ? essNavItems : hrmsNavItems;

  // Filter nav items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (!item.module) return true;
    return canAccessHrmsModule(permissions, item.module);
  });

  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm">Loading HRMS...</p>
        </div>
      </div>
    );
  }

  if (!permissions.hasAccess) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold">HRMS Access Required</h2>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access the HRMS module. Contact your HR administrator.
          </p>
          <Button variant="outline" onClick={() => navigate("/hms")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to HMS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 md:-m-6">
      {/* HRMS Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/50">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Ayuzee HRMS</h2>
              <p className="text-[10px] text-muted-foreground capitalize">{permissions.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {visibleItems.map((item, i) => (
              <div key={item.to + i}>
                {item.divider && (
                  <div className="mt-3 mb-1.5 px-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.divider}
                    </span>
                  </div>
                )}
                <NavLink
                  to={item.to}
                  end={item.to === "/hms/hrms" || item.to === "/hms/hrms/ess"}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge === "restricted" && (
                    <Badge variant="outline" className="ml-auto text-[8px] px-1 py-0 text-red-600 border-red-200">
                      HR
                    </Badge>
                  )}
                  {!item.badge && <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-30" />}
                </NavLink>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground"
            onClick={() => navigate("/hms")}
          >
            <ArrowLeft className="mr-2 h-3 w-3" /> Back to HMS
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default HrmsLayout;
