import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  Home, User, CalendarDays, Stethoscope, GraduationCap, Building2, ShoppingBag,
  BookOpen, Heart, Briefcase, BarChart3, Target, ListChecks, Settings,
  Flame, Brain, Wallet, FileText, Calendar, ClipboardList, Timer, Eye,
  Bell, Trophy, Sparkles, Search,
} from "lucide-react";

type SearchItem = {
  label: string;
  path: string;
  icon: any;
  group: string;
  keywords?: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  // Main pages
  { label: "Home", path: "/", icon: Home, group: "Main", keywords: "landing homepage" },
  { label: "Find Doctors", path: "/doctors", icon: Stethoscope, group: "Main", keywords: "consultation appointment vaidya" },
  { label: "Shop Medicines", path: "/shop", icon: ShoppingBag, group: "Main", keywords: "pharmacy buy order" },
  { label: "Health Conditions", path: "/health-conditions", icon: Heart, group: "Main", keywords: "disease treatment remedy" },
  { label: "Jobs Board", path: "/jobs", icon: Briefcase, group: "Main", keywords: "career vacancy hire" },
  { label: "Blog", path: "/blog", icon: BookOpen, group: "Main", keywords: "articles read" },

  // Portals
  { label: "Doctor Portal", path: "/doctor", icon: Stethoscope, group: "Portals", keywords: "doctor dashboard clinic" },
  { label: "Patient Dashboard", path: "/dashboard", icon: User, group: "Portals", keywords: "patient my health" },
  { label: "Student Hub", path: "/student", icon: GraduationCap, group: "Portals", keywords: "student study learn" },
  { label: "HMS / Hospital", path: "/hms", icon: Building2, group: "Portals", keywords: "hospital management beyond praxis" },
  { label: "Beyond Praxis", path: "/beyond", icon: Sparkles, group: "Portals", keywords: "life planner beyond coaching" },
  { label: "Vaidya Console", path: "/vaidya", icon: Stethoscope, group: "Portals", keywords: "vaidya practitioner" },
  { label: "Admin Panel", path: "/admin", icon: Settings, group: "Portals", keywords: "admin manage" },

  // Task Tracker
  { label: "Task Tracker — Dashboard", path: "/task-tracker", icon: BarChart3, group: "Task Tracker", keywords: "tasks overview planner" },
  { label: "Variable Tasks", path: "/task-tracker/variable-tasks", icon: ListChecks, group: "Task Tracker", keywords: "create task todo" },
  { label: "Recurring Tasks", path: "/task-tracker/recurring-tasks", icon: CalendarDays, group: "Task Tracker", keywords: "repeat schedule auto" },
  { label: "Kanban Board", path: "/task-tracker/kanban", icon: BarChart3, group: "Task Tracker", keywords: "board columns cards" },
  { label: "Decision Matrix", path: "/task-tracker/decision-matrix", icon: Target, group: "Task Tracker", keywords: "eisenhower priority urgent important" },
  { label: "Gantt Chart", path: "/task-tracker/gantt-chart", icon: BarChart3, group: "Task Tracker", keywords: "timeline project duration" },
  { label: "Monthly Calendar", path: "/task-tracker/monthly-calendar", icon: CalendarDays, group: "Task Tracker", keywords: "month view" },
  { label: "Weekly Calendar", path: "/task-tracker/weekly-calendar", icon: Calendar, group: "Task Tracker", keywords: "week view" },
  { label: "Goals", path: "/task-tracker/goals", icon: Target, group: "Task Tracker", keywords: "objectives quarterly monthly" },
  { label: "Habits Tracker", path: "/task-tracker/habits", icon: Flame, group: "Task Tracker", keywords: "streak daily routine" },
  { label: "Daily Journal", path: "/task-tracker/journal", icon: BookOpen, group: "Task Tracker", keywords: "diary write mood" },
  { label: "Pomodoro Timer", path: "/task-tracker/pomodoro", icon: Timer, group: "Task Tracker", keywords: "focus 25 minutes session" },
  { label: "Focus Mode", path: "/task-tracker/focus-mode", icon: Eye, group: "Task Tracker", keywords: "distraction free deep work" },
  { label: "Analytics & Insights", path: "/task-tracker/analytics", icon: BarChart3, group: "Task Tracker", keywords: "stats trends productivity" },
  { label: "Brain Dump", path: "/task-tracker/brain-dump", icon: Brain, group: "Task Tracker", keywords: "capture ideas thoughts" },
  { label: "Meeting Minutes", path: "/task-tracker/meeting-minutes", icon: FileText, group: "Task Tracker", keywords: "notes agenda actions" },
  { label: "Reading Log", path: "/task-tracker/reading-log", icon: BookOpen, group: "Task Tracker", keywords: "books papers articles" },
  { label: "Finance Tracker", path: "/task-tracker/finance", icon: Wallet, group: "Task Tracker", keywords: "income expense budget money" },
  { label: "SOP Checklists", path: "/task-tracker/sop", icon: ClipboardList, group: "Task Tracker", keywords: "procedure template steps" },
  { label: "Content Calendar", path: "/task-tracker/content-calendar", icon: Calendar, group: "Task Tracker", keywords: "blog social media publish" },
  { label: "Key Dates", path: "/task-tracker/key-dates", icon: CalendarDays, group: "Task Tracker", keywords: "birthday renewal deadline" },
  { label: "Yearly Planner", path: "/task-tracker/yearly-planner", icon: Calendar, group: "Task Tracker", keywords: "annual overview 12 month" },
  { label: "Vision Board", path: "/task-tracker/vision-board", icon: Sparkles, group: "Task Tracker", keywords: "goals dreams aspirations" },
  { label: "Gratitude", path: "/task-tracker/gratitude", icon: Heart, group: "Task Tracker", keywords: "thankful affirmation grateful" },
  { label: "Notifications", path: "/task-tracker/notifications", icon: Bell, group: "Task Tracker", keywords: "alerts overdue due reminders" },
  { label: "Streaks & Badges", path: "/task-tracker/streaks", icon: Trophy, group: "Task Tracker", keywords: "xp level gamification" },
  { label: "Task Templates", path: "/task-tracker/templates", icon: Sparkles, group: "Task Tracker", keywords: "prebuilt role doctor patient" },
  { label: "Weekly Review", path: "/task-tracker/weekly-review", icon: CalendarDays, group: "Task Tracker", keywords: "performance score summary" },
];

/**
 * Global Search (Cmd+K) — accessible from anywhere in the app.
 * Uses cmdk (already installed) + shadcn Command component.
 */
const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  // Group items
  const groups = [...new Set(SEARCH_ITEMS.map(i => i.group))];

  return (
    <>
      {/* Trigger button (optional — shown in header) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-32 z-50 hidden lg:flex items-center gap-2 rounded-lg border bg-card/80 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors shadow-sm"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, tasks, tools..." />
        <CommandList>
          <CommandEmpty>No results found. Try a different keyword.</CommandEmpty>
          {groups.map(group => (
            <CommandGroup key={group} heading={group}>
              {SEARCH_ITEMS.filter(i => i.group === group).map(item => (
                <CommandItem
                  key={item.path}
                  value={`${item.label} ${item.keywords || ""}`}
                  onSelect={() => handleSelect(item.path)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
