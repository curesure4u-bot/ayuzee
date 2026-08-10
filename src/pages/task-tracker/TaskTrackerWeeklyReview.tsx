import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { CalendarDays, CheckCircle, AlertTriangle, TrendingUp, Clock, Trophy, Target, Zap } from "lucide-react";
import type { VariableTask, ScheduleOccurrence } from "./types";

type Props = {
  tasks: VariableTask[];
  schedule: ScheduleOccurrence[];
};

const COLORS = ["#10b981", "#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#6b7280"];

const TaskTrackerWeeklyReview = ({ tasks, schedule }: Props) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Calculate start of current week (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday = 1
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  }, []);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split("T")[0];
  }, [weekStart]);

  // This week's tasks
  const weekTasks = useMemo(() => {
    return tasks.filter(t => {
      const date = t.due_date || t.start_date || "";
      return date >= weekStart && date <= weekEnd;
    });
  }, [tasks, weekStart, weekEnd]);

  const weekSchedule = useMemo(() => {
    return schedule.filter(s => s.occurrence_date >= weekStart && s.occurrence_date <= weekEnd);
  }, [schedule, weekStart, weekEnd]);

  // Stats
  const totalWeekTasks = weekTasks.length + weekSchedule.length;
  const completedWeekTasks = weekTasks.filter(t => t.is_completed).length + weekSchedule.filter(s => s.is_done).length;
  const weekCompletionRate = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;
  const overdueThisWeek = weekTasks.filter(t => t.due_date && t.due_date < todayStr && !t.is_completed).length;
  const highPriorityPending = weekTasks.filter(t => (t.priority === "Very High" || t.priority === "High") && !t.is_completed).length;

  // Daily breakdown
  const dailyBreakdown = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((dayName, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayTasks = weekTasks.filter(t => (t.due_date || t.start_date) === dateStr);
      const daySchedule = weekSchedule.filter(s => s.occurrence_date === dateStr);
      const total = dayTasks.length + daySchedule.length;
      const done = dayTasks.filter(t => t.is_completed).length + daySchedule.filter(s => s.is_done).length;
      return { day: dayName, total, done, pending: total - done };
    });
  }, [weekTasks, weekSchedule, weekStart]);

  // Status distribution this week
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    weekTasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [weekTasks]);

  // Priority breakdown
  const priorityBreakdown = useMemo(() => {
    const priorities = ["Very High", "High", "Medium", "Low", "Very Low"];
    return priorities.map(p => ({ name: p, count: weekTasks.filter(t => t.priority === p).length })).filter(p => p.count > 0);
  }, [weekTasks]);

  // Top accomplishments (completed this week)
  const accomplishments = weekTasks.filter(t => t.is_completed).slice(0, 8);

  // Remaining urgent tasks
  const urgentRemaining = weekTasks.filter(t => !t.is_completed && (t.priority === "Very High" || t.priority === "High")).slice(0, 6);

  // Performance score (weighted)
  const performanceScore = useMemo(() => {
    if (totalWeekTasks === 0) return 0;
    let score = weekCompletionRate;
    if (overdueThisWeek === 0) score += 10; // Bonus for no overdue
    if (weekCompletionRate >= 80) score += 10; // Bonus for high completion
    return Math.min(100, score);
  }, [weekCompletionRate, overdueThisWeek, totalWeekTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-teal-600" /> Weekly Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Week of {weekStart} to {weekEnd}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Trophy className="mr-1 h-3.5 w-3.5 text-amber-500" /> Score: {performanceScore}/100
        </Badge>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card>
          <CardContent className="p-3 text-center">
            <Zap className="h-5 w-5 mx-auto text-teal-600 mb-1" />
            <p className="text-xl font-bold">{totalWeekTasks}</p>
            <p className="text-[10px] text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-xl font-bold text-green-700">{completedWeekTasks}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-xl font-bold">{weekCompletionRate}%</p>
            <p className="text-[10px] text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className={overdueThisWeek > 0 ? "border-red-200" : ""}>
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className={`text-xl font-bold ${overdueThisWeek > 0 ? "text-red-600" : ""}`}>{overdueThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <p className="text-xl font-bold">{highPriorityPending}</p>
            <p className="text-[10px] text-muted-foreground">High Priority Left</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Breakdown Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={dailyBreakdown}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="done" stackId="a" fill="#10b981" name="Done" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#e5e7eb" name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status & Priority */}
        <div className="grid gap-4 grid-rows-2">
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs">Status Distribution</CardTitle></CardHeader>
            <CardContent className="h-20">
              <ResponsiveContainer>
                <PieChart><Pie data={statusBreakdown} innerRadius={18} outerRadius={35} dataKey="value">
                  {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs">Priority Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {priorityBreakdown.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="text-[10px] w-16 text-muted-foreground">{p.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(p.count / (weekTasks.length || 1)) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold w-4">{p.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accomplishments */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center gap-2">
              <Trophy className="h-4 w-4" /> This Week's Accomplishments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accomplishments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No completed tasks yet this week</p>
            ) : (
              <div className="space-y-2">
                {accomplishments.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="font-medium flex-1 truncate">{t.task_name}</span>
                    <Badge variant="outline" className="text-[9px]">{t.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent Remaining */}
        <Card className={urgentRemaining.length > 0 ? "border-amber-200" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Still Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urgentRemaining.length === 0 ? (
              <p className="text-sm text-green-600 py-4 text-center font-medium">All high-priority tasks done! Great work.</p>
            ) : (
              <div className="space-y-2">
                {urgentRemaining.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium flex-1 truncate">{t.task_name}</span>
                    <span className="text-[10px] text-muted-foreground">{t.due_date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Score */}
      <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
        <CardContent className="p-6 text-center">
          <Trophy className="h-8 w-8 mx-auto text-amber-500 mb-2" />
          <h3 className="text-xl font-bold">
            {performanceScore >= 80 ? "Excellent Week!" :
             performanceScore >= 60 ? "Good Progress!" :
             performanceScore >= 40 ? "Keep Going!" : "Let's Do Better Next Week!"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            You completed {completedWeekTasks} of {totalWeekTasks} tasks with {overdueThisWeek} overdue.
          </p>
          <div className="mt-3 max-w-xs mx-auto">
            <Progress value={performanceScore} className="h-3" />
            <p className="text-xs text-teal-700 font-medium mt-1">Performance Score: {performanceScore}/100</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerWeeklyReview;
