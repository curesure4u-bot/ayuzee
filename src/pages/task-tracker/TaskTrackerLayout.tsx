import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3, CalendarDays, CalendarRange, CheckSquare, ClipboardList,
  GanttChart, Home, KanbanSquare, LayoutGrid, ListChecks, Menu,
  RefreshCw, Target, X, Flame, BookOpen, Trophy, Sparkles, CalendarCheck,
  Timer, Eye, Bell, BarChart3 as Analytics,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "SETUP",
    items: [
      { to: "/task-tracker", label: "Dashboard", icon: Home, end: true },
      { to: "/task-tracker/setup", label: "Setup", icon: LayoutGrid },
      { to: "/task-tracker/help", label: "How to Use", icon: Home },
    ],
  },
  {
    label: "CALENDARS",
    items: [
      { to: "/task-tracker/monthly-calendar", label: "Monthly Calendar", icon: CalendarDays },
      { to: "/task-tracker/weekly-calendar", label: "Weekly Calendar", icon: CalendarRange },
    ],
  },
  {
    label: "TASK CREATION",
    items: [
      { to: "/task-tracker/variable-tasks", label: "Variable Tasks", icon: CheckSquare },
      { to: "/task-tracker/recurring-tasks", label: "Recurring Tasks", icon: RefreshCw },
      { to: "/task-tracker/tasks-schedule", label: "Tasks Schedule", icon: ClipboardList },
      { to: "/task-tracker/tasks-filter", label: "Tasks Filter", icon: ListChecks },
    ],
  },
  {
    label: "EXTRA RESOURCES",
    items: [
      { to: "/task-tracker/decision-matrix", label: "Decision Matrix", icon: Target },
      { to: "/task-tracker/kanban", label: "Kanban Board", icon: KanbanSquare },
      { to: "/task-tracker/gantt-chart", label: "Gantt Chart", icon: GanttChart },
    ],
  },
  {
    label: "LIFE PLANNER",
    items: [
      { to: "/task-tracker/goals", label: "Goals", icon: Trophy },
      { to: "/task-tracker/habits", label: "Habits Tracker", icon: Flame },
      { to: "/task-tracker/journal", label: "Daily Journal", icon: BookOpen },
      { to: "/task-tracker/weekly-review", label: "Weekly Review", icon: CalendarCheck },
      { to: "/task-tracker/templates", label: "Task Templates", icon: Sparkles },
    ],
  },
  {
    label: "PRODUCTIVITY",
    items: [
      { to: "/task-tracker/pomodoro", label: "Pomodoro Timer", icon: Timer },
      { to: "/task-tracker/focus-mode", label: "Focus Mode", icon: Eye },
      { to: "/task-tracker/analytics", label: "Analytics & Insights", icon: BarChart3 },
      { to: "/task-tracker/notifications", label: "Notifications", icon: Bell },
      { to: "/task-tracker/streaks", label: "Streaks & Badges", icon: Trophy },
    ],
  },
];

const TaskTrackerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Mobile toggle */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link to="/task-tracker" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
            <LayoutGrid className="h-4 w-4" />
          </span>
          Task Tracker
        </Link>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] transform border-r bg-card/95 shadow-lg backdrop-blur transition-transform lg:static lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <Link to="/task-tracker" className="mb-4 flex items-center gap-3 px-2 font-display text-xl font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
              <LayoutGrid className="h-5 w-5" />
            </span>
            Task Tracker
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navSections.map((section) => (
              <div key={section.label} className="mb-2">
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <Separator className="my-3" />
          <Button variant="ghost" size="sm" asChild className="justify-start text-muted-foreground">
            <Link to="/login">Switch Portal</Link>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TaskTrackerLayout;
