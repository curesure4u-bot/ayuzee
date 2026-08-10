import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users, Target, Zap } from "lucide-react";
import type { VariableTask, ScheduleOccurrence } from "./types";
import { getDaysLeft } from "./types";

type Props = {
  tasks: VariableTask[];
  schedule: ScheduleOccurrence[];
};

const COLORS = ["#0d9488", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#6b7280", "#ec4899"];

const TaskTrackerAnalytics = ({ tasks, schedule }: Props) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // === CORE METRICS ===
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayStr && !t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProgress = totalTasks > 0 ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / totalTasks) : 0;

  // === COMPLETION TREND (last 30 days) ===
  const completionTrend = useMemo(() => {
    const days: { date: string; completed: number; created: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        completed: tasks.filter(t => t.completed_at && t.completed_at.startsWith(dateStr)).length,
        created: tasks.filter(t => t.created_at.startsWith(dateStr)).length,
      });
    }
    return days;
  }, [tasks]);

  // === PRIORITY DISTRIBUTION ===
  const priorityDist = useMemo(() => {
    const priorities = ["Very High", "High", "Medium", "Low", "Very Low", "On Hold"];
    return priorities.map(p => ({
      name: p,
      total: tasks.filter(t => t.priority === p).length,
      completed: tasks.filter(t => t.priority === p && t.is_completed).length,
      pending: tasks.filter(t => t.priority === p && !t.is_completed).length,
    })).filter(p => p.total > 0);
  }, [tasks]);

  // === PERSON WORKLOAD ===
  const personWorkload = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(t => {
      const person = t.person_in_charge || "Unassigned";
      if (!counts[person]) counts[person] = { total: 0, completed: 0 };
      counts[person].total++;
      if (t.is_completed) counts[person].completed++;
    });
    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [tasks]);

  // === KANBAN FLOW ===
  const kanbanFlow = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.kanban_category] = (counts[t.kanban_category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // === DECISION DISTRIBUTION ===
  const decisionDist = useMemo(() => {
    const decisions = ["To Do", "To Decide", "To Delegate", "To Delete"];
    return decisions.map(d => ({
      name: d,
      count: tasks.filter(t => t.decision === d).length,
    }));
  }, [tasks]);

  // === OVERDUE ANALYSIS ===
  const overdueByPriority = useMemo(() => {
    const overdue = tasks.filter(t => t.due_date && t.due_date < todayStr && !t.is_completed);
    const priorities = ["Very High", "High", "Medium", "Low", "Very Low"];
    return priorities.map(p => ({
      name: p,
      count: overdue.filter(t => t.priority === p).length,
    })).filter(p => p.count > 0);
  }, [tasks, todayStr]);

  // === PRODUCTIVITY SCORE ===
  const productivityScore = useMemo(() => {
    let score = 0;
    if (completionRate >= 80) score += 30;
    else if (completionRate >= 50) score += 20;
    else score += 10;

    if (overdueTasks === 0) score += 25;
    else if (overdueTasks <= 2) score += 15;
    else score += 5;

    if (avgProgress >= 60) score += 25;
    else if (avgProgress >= 30) score += 15;
    else score += 5;

    // Recent activity bonus
    const recentCompleted = tasks.filter(t => {
      if (!t.completed_at) return false;
      const d = new Date(t.completed_at);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }).length;
    if (recentCompleted >= 5) score += 20;
    else if (recentCompleted >= 2) score += 10;

    return Math.min(100, score);
  }, [completionRate, overdueTasks, avgProgress, tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-600" /> Analytics & Insights
          </h1>
          <p className="text-sm text-muted-foreground">Understand your productivity patterns</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1.5">
          <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" /> Score: {productivityScore}/100
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card><CardContent className="p-3 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" />
          <p className="text-xl font-bold">{completedTasks}/{totalTasks}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-teal-600 mb-1" />
          <p className="text-xl font-bold">{completionRate}%</p>
          <p className="text-[10px] text-muted-foreground">Completion Rate</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Target className="h-5 w-5 mx-auto text-blue-600 mb-1" />
          <p className="text-xl font-bold">{avgProgress}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Progress</p>
        </CardContent></Card>
        <Card className={overdueTasks > 0 ? "border-red-200" : ""}><CardContent className="p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-1" />
          <p className={`text-xl font-bold ${overdueTasks > 0 ? "text-red-600" : ""}`}>{overdueTasks}</p>
          <p className="text-[10px] text-muted-foreground">Overdue</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock className="h-5 w-5 mx-auto text-purple-600 mb-1" />
          <p className="text-xl font-bold">{schedule.filter(s => s.is_done).length}</p>
          <p className="text-[10px] text-muted-foreground">Recurring Done</p>
        </CardContent></Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completion Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">30-Day Activity Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" dot={false} />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Priority Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={priorityDist}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="completed" fill="#10b981" name="Done" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" fill="#e5e7eb" name="Pending" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kanban Flow */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Kanban Distribution</CardTitle></CardHeader>
          <CardContent className="h-36">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={kanbanFlow} innerRadius={25} outerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {kanbanFlow.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Decision Matrix */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Decision Distribution</CardTitle></CardHeader>
          <CardContent className="h-36">
            <ResponsiveContainer>
              <BarChart data={decisionDist} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 9 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Person Workload */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><Users className="h-3 w-3" /> Workload</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {personWorkload.map(p => (
                <div key={p.name} className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-medium">{p.name}</span>
                    <span>{p.completed}/{p.total} ({p.rate}%)</span>
                  </div>
                  <Progress value={p.rate} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Analysis + Productivity Score */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={overdueTasks > 0 ? "border-red-200" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600">Overdue Analysis</CardTitle></CardHeader>
          <CardContent>
            {overdueByPriority.length === 0 ? (
              <p className="text-sm text-green-600 py-4 text-center font-medium">No overdue tasks! Excellent.</p>
            ) : (
              <div className="h-32">
                <ResponsiveContainer>
                  <BarChart data={overdueByPriority}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
          <CardContent className="p-6 text-center">
            <Zap className="h-10 w-10 mx-auto text-amber-500 mb-2" />
            <p className="text-3xl font-bold text-teal-700">{productivityScore}</p>
            <p className="text-sm text-teal-600 font-medium">Productivity Score</p>
            <div className="mt-3 max-w-[200px] mx-auto">
              <Progress value={productivityScore} className="h-3" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {productivityScore >= 80 ? "Outstanding! You're a productivity machine." :
               productivityScore >= 60 ? "Great work! Keep the momentum going." :
               productivityScore >= 40 ? "Good progress. Focus on reducing overdue tasks." :
               "Room for improvement. Try completing smaller tasks first."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskTrackerAnalytics;
