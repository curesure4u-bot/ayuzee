import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, TrendingUp, Clock, Users, Flame, Target, Zap } from "lucide-react";
import type { VariableTask } from "./types";
import { getDaysLeft } from "./types";

type Suggestion = {
  id: string;
  type: "warning" | "insight" | "action" | "pattern";
  icon: any;
  message: string;
  detail: string;
  color: string;
};

type Props = {
  tasks: VariableTask[];
};

/**
 * Smart Suggestions card — analyzes task patterns and generates
 * predictive, actionable recommendations for the user.
 */
const SmartSuggestions = ({ tasks }: Props) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const suggestions = useMemo(() => {
    const results: Suggestion[] = [];

    // 1. High-priority tasks aging (not started, created >3 days ago)
    const agingHighPriority = tasks.filter(t =>
      (t.priority === "Very High" || t.priority === "High") &&
      !t.is_completed && t.progress === 0 &&
      getDaysLeft(t.created_at.split("T")[0]) !== null &&
      Math.abs(getDaysLeft(t.created_at.split("T")[0])!) > 3
    );
    if (agingHighPriority.length > 0) {
      results.push({
        id: "aging-high",
        type: "warning",
        icon: AlertTriangle,
        message: `${agingHighPriority.length} high-priority task${agingHighPriority.length > 1 ? "s" : ""} haven't been started`,
        detail: `"${agingHighPriority[0].task_name}"${agingHighPriority.length > 1 ? ` and ${agingHighPriority.length - 1} more` : ""} — consider delegating or scheduling a focus session.`,
        color: "bg-red-50 border-red-200 text-red-800",
      });
    }

    // 2. Tasks due today with 0% progress
    const dueTodayNoProgress = tasks.filter(t => t.due_date === todayStr && !t.is_completed && t.progress === 0);
    if (dueTodayNoProgress.length > 0) {
      results.push({
        id: "due-today-zero",
        type: "warning",
        icon: Clock,
        message: `${dueTodayNoProgress.length} task${dueTodayNoProgress.length > 1 ? "s" : ""} due today with 0% progress`,
        detail: `Start with "${dueTodayNoProgress[0].task_name}" — even 10 minutes of progress helps.`,
        color: "bg-amber-50 border-amber-200 text-amber-800",
      });
    }

    // 3. Overdue tasks — suggest delegation
    const overdue = tasks.filter(t => t.due_date && t.due_date < todayStr && !t.is_completed);
    if (overdue.length >= 3) {
      results.push({
        id: "overdue-delegate",
        type: "action",
        icon: Users,
        message: `${overdue.length} overdue tasks — consider delegating some`,
        detail: `You can't do everything alone. Move low-importance overdue tasks to "Delegate" in the Decision Matrix.`,
        color: "bg-blue-50 border-blue-200 text-blue-800",
      });
    }

    // 4. Pattern: tasks completed on specific days
    const completedTasks = tasks.filter(t => t.completed_at);
    if (completedTasks.length >= 5) {
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      completedTasks.forEach(t => {
        const d = new Date(t.completed_at!);
        dayCounts[d.getDay()]++;
      });
      const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
      if (dayCounts[maxDay] >= 3 && maxDay === dayOfWeek) {
        results.push({
          id: "pattern-day",
          type: "pattern",
          icon: TrendingUp,
          message: `You're most productive on ${dayNames[maxDay]}s!`,
          detail: `Based on your history, you complete the most tasks on ${dayNames[maxDay]}s. Schedule your hard tasks today.`,
          color: "bg-green-50 border-green-200 text-green-800",
        });
      } else if (dayCounts[maxDay] >= 3) {
        results.push({
          id: "pattern-day-other",
          type: "pattern",
          icon: TrendingUp,
          message: `Your most productive day is ${dayNames[maxDay]}`,
          detail: `You tend to complete more tasks on ${dayNames[maxDay]}s. Consider scheduling important work for that day.`,
          color: "bg-teal-50 border-teal-200 text-teal-800",
        });
      }
    }

    // 5. Streak suggestion — if they have momentum
    const recent3Days = tasks.filter(t => {
      if (!t.completed_at) return false;
      const diff = Math.abs(getDaysLeft(t.completed_at.split("T")[0]) || 999);
      return diff <= 3;
    });
    if (recent3Days.length >= 3) {
      results.push({
        id: "momentum",
        type: "insight",
        icon: Flame,
        message: "You're on fire! Keep the momentum going",
        detail: `You completed ${recent3Days.length} tasks in the last 3 days. Set today's target: at least 1 more.`,
        color: "bg-orange-50 border-orange-200 text-orange-800",
      });
    }

    // 6. Too many tasks in "Backlog" / not started
    const backlogTasks = tasks.filter(t => t.kanban_category === "Backlog" && !t.is_completed);
    if (backlogTasks.length > 5) {
      results.push({
        id: "backlog-overload",
        type: "action",
        icon: Target,
        message: `${backlogTasks.length} tasks sitting in Backlog`,
        detail: `Move 2-3 into "To-Do" for this week, or delete ones that no longer matter.`,
        color: "bg-purple-50 border-purple-200 text-purple-800",
      });
    }

    // 7. Tasks with same person overloaded
    const personCounts: Record<string, number> = {};
    tasks.filter(t => !t.is_completed && t.person_in_charge).forEach(t => {
      personCounts[t.person_in_charge] = (personCounts[t.person_in_charge] || 0) + 1;
    });
    const overloadedPerson = Object.entries(personCounts).find(([_, count]) => count >= 5);
    if (overloadedPerson) {
      results.push({
        id: "person-overload",
        type: "insight",
        icon: Users,
        message: `${overloadedPerson[0]} has ${overloadedPerson[1]} pending tasks`,
        detail: `Consider redistributing — check if some can be delegated to others.`,
        color: "bg-indigo-50 border-indigo-200 text-indigo-800",
      });
    }

    // 8. No tasks due today (suggest planning)
    const dueToday = tasks.filter(t => t.due_date === todayStr && !t.is_completed);
    if (dueToday.length === 0 && tasks.filter(t => !t.is_completed).length > 0) {
      results.push({
        id: "no-today",
        type: "action",
        icon: Zap,
        message: "No tasks scheduled for today",
        detail: `You have ${tasks.filter(t => !t.is_completed).length} pending tasks. Pick 1-3 to focus on today — use the Quick Add button.`,
        color: "bg-sky-50 border-sky-200 text-sky-800",
      });
    }

    // 9. Tasks almost done (>80%) — nudge to finish
    const almostDone = tasks.filter(t => t.progress >= 80 && t.progress < 100 && !t.is_completed);
    if (almostDone.length > 0) {
      results.push({
        id: "almost-done",
        type: "action",
        icon: Target,
        message: `${almostDone.length} task${almostDone.length > 1 ? "s" : ""} almost complete (80%+)`,
        detail: `"${almostDone[0].task_name}" is at ${almostDone[0].progress}% — just a little push to finish!`,
        color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
    }

    // 10. Completion rate insight
    const totalActive = tasks.length;
    const completed = tasks.filter(t => t.is_completed).length;
    const rate = totalActive > 0 ? Math.round((completed / totalActive) * 100) : 0;
    if (rate >= 70) {
      results.push({
        id: "rate-good",
        type: "insight",
        icon: TrendingUp,
        message: `Your completion rate is ${rate}% — excellent!`,
        detail: "You're performing above average. Keep this momentum and aim for 80%+.",
        color: "bg-green-50 border-green-200 text-green-800",
      });
    } else if (rate < 30 && totalActive > 5) {
      results.push({
        id: "rate-low",
        type: "warning",
        icon: AlertTriangle,
        message: `Completion rate is only ${rate}%`,
        detail: "Try reducing your task list to 5-7 active items. Focus beats quantity.",
        color: "bg-red-50 border-red-200 text-red-800",
      });
    }

    return results.slice(0, 5); // Show max 5 suggestions
  }, [tasks, todayStr, dayOfWeek]);

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" /> Smart Suggestions
          <Badge variant="secondary" className="text-[9px] ml-auto">AI-powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map(s => (
          <div key={s.id} className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${s.color}`}>
            <s.icon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold">{s.message}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartSuggestions;
