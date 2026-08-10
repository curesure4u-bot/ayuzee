import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle, LayoutGrid, CalendarDays, CalendarRange, CheckSquare,
  RefreshCw, ClipboardList, ListChecks, Target, BarChart3,
  Trophy, Flame, BookOpen, Timer, Eye, Bell, Sparkles,
} from "lucide-react";

const sections = [
  {
    category: "SETUP",
    items: [
      {
        icon: LayoutGrid,
        title: "Setup",
        description: "Configure your tracker before starting. Set your task statuses with emojis, define Kanban board columns, add people who can be assigned tasks, mark your working days, and add holidays/days off.",
        steps: [
          "Set your emoji pool and status names (To do, In progress, Completed, etc.)",
          "Enter Kanban categories in the order you want them displayed",
          "Add all people who can be in charge of tasks",
          "Check/uncheck your working days (affects Gantt chart calculations)",
          "Enter holidays with dates and descriptions",
        ],
      },
    ],
  },
  {
    category: "CALENDARS",
    items: [
      {
        icon: CalendarDays,
        title: "Monthly Calendar",
        description: "View all tasks for any month. Displays tasks on their due dates in a grid format. Filter by done/not-done status and color-code by priority or decision matrix quadrant.",
        steps: [
          "Select the year, month, and your preferred start day of the week",
          "Choose to view all tasks, done only, or not-done only",
          "Select whether colors represent Priority levels or Decision quadrants",
          "Use 'Export PDF' button to print your calendar",
        ],
      },
      {
        icon: CalendarRange,
        title: "Weekly Calendar",
        description: "A focused 7-day view with progress rings showing daily completion percentage. Each day column shows tasks with color-coding.",
        steps: [
          "Enter year, month, and start day number",
          "Each day shows a progress donut (% of tasks completed that day)",
          "Filter by status and choose color legend (priority or decision)",
        ],
      },
    ],
  },
  {
    category: "TASK CREATION",
    items: [
      {
        icon: CheckSquare,
        title: "Variable Tasks",
        description: "Your main task entry page. Create one-time tasks with all details: name, description, status, priority, person, dates, Kanban category, importance, urgency. The Decision column auto-calculates from importance + urgency.",
        steps: [
          "Click 'New Task' and fill in the details",
          "The 'Days Left' column calculates automatically from the due date",
          "The 'Decision' column auto-fills based on Importance × Urgency",
          "Tick the checkbox when a task is done",
          "Use the 'Highlight Task' dropdown to spotlight a specific task",
          "Export all tasks as PDF with the export button",
        ],
      },
      {
        icon: RefreshCw,
        title: "Recurring Tasks",
        description: "Define tasks that repeat automatically. Set the frequency (daily, weekly, monthly, etc.), the first occurrence date, and optionally an end date. The system generates all occurrences for you.",
        steps: [
          "Enter task name and select frequency (Every Week, Every Month, etc.)",
          "Set priority, person in charge, importance and urgency",
          "Enter the first occurrence date (when it starts)",
          "Optionally enter an end date (leave blank for indefinite)",
          "Use Pause/Play to temporarily stop generating occurrences",
        ],
      },
      {
        icon: ClipboardList,
        title: "Tasks Schedule",
        description: "Auto-generated timeline of all recurring task occurrences. Tick them off as you complete each one. You can override priority, person, or decision for individual occurrences.",
        steps: [
          "Click 'Regenerate' to create/refresh the occurrence list",
          "Tick the Done checkbox when you complete each occurrence",
          "Overdue items are highlighted in red",
        ],
      },
      {
        icon: ListChecks,
        title: "Tasks Filter",
        description: "Advanced filtering across ALL tasks (variable + recurring). Filter by 15+ criteria and sort by date, days left, or progress.",
        steps: [
          "Use any combination of filters to narrow your view",
          "Sort by Start Date, Due Date, Days Left, or Progress",
          "Toggle between ascending/descending order",
          "Filter by Recurring/Variable to see only one type",
        ],
      },
    ],
  },
  {
    category: "EXTRA RESOURCES",
    items: [
      {
        icon: Target,
        title: "Decision Matrix (Eisenhower)",
        description: "Visualize tasks in 4 quadrants based on Importance × Urgency. DO (important + urgent), DECIDE (important + not urgent), DELEGATE (not important + urgent), DELETE (not important + not urgent).",
        steps: [
          "Select year and month to filter tasks",
          "Choose to view All, Done only, or Not Done only",
          "Each quadrant shows a completion ring and task list",
          "Use this to prioritize what truly matters",
        ],
      },
      {
        icon: BarChart3,
        title: "Kanban Board",
        description: "Visual board with columns matching your Kanban categories. Cards show task details, progress bars, and assignee. Move tasks between columns with arrow buttons.",
        steps: [
          "Use filters at the top to narrow which tasks appear",
          "Click arrow buttons on cards to move between columns",
          "Sort by Due Date, Start Date, or Progress",
          "Filter by Person, Priority, Status, or Decision",
        ],
      },
      {
        icon: BarChart3,
        title: "Gantt Chart",
        description: "Project timeline visualization. Select variable tasks (must have start + due dates) and see them as horizontal bars across a week grid. Color-coded by status.",
        steps: [
          "Enter your project name and select the project manager",
          "Check tasks to include (only tasks with both dates appear)",
          "Tick the checkbox when a task is completed",
          "Overall progress shows as a donut chart",
          "Export as PDF for sharing or printing",
        ],
      },
    ],
  },
  {
    category: "LIFE PLANNER",
    items: [
      { icon: Trophy, title: "Goals", description: "Set quarterly, monthly, or weekly goals. Track progress with a slider. Mark as achieved when complete." },
      { icon: Flame, title: "Habits Tracker", description: "Build daily habits with streak tracking. See a 30-day heatmap of completions. Mark today as done with one click." },
      { icon: BookOpen, title: "Daily Journal", description: "Write quick daily reflections with mood tracking (Great → Bad). Build a journal streak." },
      { icon: Sparkles, title: "Task Templates", description: "One-click templates pre-built for your role (Doctor, Patient, Student, HMS). Instantly adds 7-9 relevant tasks." },
    ],
  },
  {
    category: "PRODUCTIVITY",
    items: [
      { icon: Timer, title: "Pomodoro Timer", description: "Focus sessions with Classic (25/5), Short (15/3), or Deep Work (50/10) presets. Link to a specific task. Track sessions completed today." },
      { icon: Eye, title: "Focus Mode", description: "Full-screen distraction-free view for a single task. Shows timer, progress buttons, and quick notes. Minimizes all UI." },
      { icon: BarChart3, title: "Analytics & Insights", description: "30-day completion trends, priority breakdown, person workload, overdue analysis, and a computed Productivity Score." },
      { icon: Bell, title: "Notifications", description: "Smart alerts: overdue tasks, due today, due within 3 days, high-priority not started, and tasks almost complete (90%+)." },
      { icon: Trophy, title: "Streaks & Badges", description: "Gamification: earn XP for completing tasks, unlock 11 badges, level up, and see your 30-day completion heatmap." },
    ],
  },
];

const TaskTrackerHelp = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-teal-600" /> How to Use the Task Tracker
        </h1>
        <p className="text-sm text-muted-foreground">Complete guide to every section and feature</p>
      </div>

      {/* Quick Tips */}
      <Card className="border-teal-200 bg-teal-50/30">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-teal-700 mb-2">Quick Start Tips</h3>
          <ul className="space-y-1 text-xs text-teal-800">
            <li>1. Start with <strong>Setup</strong> — configure your statuses, people, and working days</li>
            <li>2. Create tasks in <strong>Variable Tasks</strong> (one-time) or <strong>Recurring Tasks</strong> (repeating)</li>
            <li>3. Use the <strong>Dashboard</strong> to see your overview at a glance</li>
            <li>4. Use the <strong>floating + button</strong> (bottom-right) to quickly add tasks from any page</li>
            <li>5. Try <strong>Templates</strong> to instantly populate role-specific tasks</li>
            <li>6. Use <strong>Focus Mode</strong> or <strong>Pomodoro Timer</strong> for deep work sessions</li>
          </ul>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-amber-700 mb-1">Important Notes</h3>
          <ul className="space-y-1 text-xs text-amber-800">
            <li>• White background cells are editable. Gray/colored cells are auto-calculated.</li>
            <li>• The <strong>Decision</strong> column auto-calculates from Importance × Urgency.</li>
            <li>• The <strong>Days Left</strong> column auto-calculates from Due Date.</li>
            <li>• Copy & paste data instead of moving/cutting to avoid issues.</li>
            <li>• Use the sidebar menu to navigate between all sections.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.map(section => (
        <div key={section.category}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">{section.category}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.items.map(item => (
              <Card key={item.title} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-teal-600" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  {"steps" in item && item.steps && (
                    <ol className="space-y-0.5 text-[11px] list-decimal list-inside text-muted-foreground">
                      {item.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-4" />
        </div>
      ))}

      {/* Footer */}
      <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-medium text-teal-700">Enjoy staying organized!</p>
          <p className="text-xs text-teal-600 mt-1">
            This All-in-One Task Tracker adapts to your role — Doctor, Patient, Student, or HMS.
            Use it to manage your entire professional sphere.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerHelp;
