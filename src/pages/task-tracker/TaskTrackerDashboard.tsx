import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Target, CalendarDays, TrendingUp, Users, ListChecks } from "lucide-react";
import type { VariableTask, RecurringTask, ScheduleOccurrence } from "./types";
import { getDaysLeft } from "./types";

type Props = {
  tasks: VariableTask[];
  recurringTasks: RecurringTask[];
  schedule: ScheduleOccurrence[];
};

const COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#6b7280"];

const TaskTrackerDashboard = ({ tasks, recurringTasks, schedule }: Props) => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Stats
  const totalTasks = tasks.length + schedule.length;
  const completedTasks = tasks.filter(t => t.is_completed).length + schedule.filter(s => s.is_done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todaysTasks = tasks.filter(t => t.due_date === today && !t.is_completed);
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && !t.is_completed);
  const upcomingTasks = tasks
    .filter(t => t.due_date && t.due_date >= today && !t.is_completed)
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 10);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorities = ["Very High", "High", "Medium", "Low", "Very Low", "On Hold"];
    return priorities.map(p => ({
      name: p,
      count: tasks.filter(t => t.priority === p).length,
    }));
  }, [tasks]);

  // Person distribution
  const personData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.person_in_charge) counts[t.person_in_charge] = (counts[t.person_in_charge] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // Kanban distribution
  const kanbanData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.kanban_category] = (counts[t.kanban_category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // Decision matrix counts
  const decisionCounts = useMemo(() => ({
    "To Do": tasks.filter(t => t.decision === "To Do" && !t.is_completed).length,
    "To Decide": tasks.filter(t => t.decision === "To Decide" && !t.is_completed).length,
    "To Delegate": tasks.filter(t => t.decision === "To Delegate" && !t.is_completed).length,
    "To Delete": tasks.filter(t => t.decision === "To Delete" && !t.is_completed).length,
  }), [tasks]);

  // Mini calendar for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startOffset = firstDay.getDay();
    const days: { day: number; hasTask: boolean; isToday: boolean }[] = [];

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        hasTask: tasks.some(t => t.due_date === dateStr || t.start_date === dateStr),
        isToday: dateStr === today,
      });
    }
    return { days, startOffset };
  }, [tasks, currentMonth, currentYear, today]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your task overview at a glance</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {monthNames[currentMonth]} {currentYear}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-100 text-teal-700">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todaysTasks.length}</p>
              <p className="text-xs text-muted-foreground">Due Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className={overdueTasks.length > 0 ? "border-red-200" : ""}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${overdueTasks.length > 0 ? "text-red-600" : ""}`}>{overdueTasks.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Calendar + Completion */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-teal-600" />
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <span key={d} className="font-medium text-muted-foreground py-1">{d}</span>
                ))}
                {Array(calendarDays.startOffset).fill(null).map((_, i) => <span key={`e-${i}`} />)}
                {calendarDays.days.map(({ day, hasTask, isToday }) => (
                  <span
                    key={day}
                    className={`rounded py-1 text-xs ${
                      isToday ? "bg-teal-600 text-white font-bold" :
                      hasTask ? "bg-teal-100 text-teal-800 font-medium" : ""
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-100 border border-teal-300" /> Has task</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-600" /> Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Overall Completion */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Overall Completion</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-32 w-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { value: completionRate },
                        { value: 100 - completionRate },
                      ]}
                      innerRadius={40}
                      outerRadius={55}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#0d9488" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-teal-700">{completionRate}%</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Center: Today's Tasks + Upcoming */}
        <div className="space-y-4">
          {/* Today's Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Today's Tasks ({todaysTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No tasks due today</p>
              ) : (
                <div className="space-y-2">
                  {todaysTasks.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center gap-2 rounded-lg border p-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{t.task_name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.person_in_charge}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {upcomingTasks.slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.is_completed && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                      <span className="truncate font-medium">{t.task_name}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 ml-2">{t.due_date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Decision Matrix + Charts */}
        <div className="space-y-4">
          {/* Decision Matrix Mini */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-purple-600" /> Decision Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Tasks: {completedTasks} of {tasks.filter(t => !t.is_completed).length + completedTasks}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-red-50 p-3 text-center border border-red-100">
                  <p className="text-lg font-bold text-red-700">{decisionCounts["To Do"]}</p>
                  <p className="text-[10px] text-red-600 font-medium">TO DO</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center border border-amber-100">
                  <p className="text-lg font-bold text-amber-700">{decisionCounts["To Decide"]}</p>
                  <p className="text-[10px] text-amber-600 font-medium">TO DECIDE</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center border border-blue-100">
                  <p className="text-lg font-bold text-blue-700">{decisionCounts["To Delegate"]}</p>
                  <p className="text-[10px] text-blue-600 font-medium">TO DELEGATE</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center border border-gray-200">
                  <p className="text-lg font-bold text-gray-600">{decisionCounts["To Delete"]}</p>
                  <p className="text-[10px] text-gray-500 font-medium">TO DELETE</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Status Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Task Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} innerRadius={25} outerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Priority Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-28">
                <ResponsiveContainer>
                  <BarChart data={priorityData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10 }} />
                    <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskTrackerDashboard;
