import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, CheckCircle, Download } from "lucide-react";
import type { VariableTask, ScheduleOccurrence } from "./types";
import { getPriorityColor, getDecisionColor } from "./types";
import { exportMonthlyCalendarPdf } from "./exportPdf";

type Props = {
  tasks: VariableTask[];
  schedule: ScheduleOccurrence[];
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TaskTrackerMonthly = ({ tasks, schedule }: Props) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear().toString());
  const [month, setMonth] = useState(now.getMonth().toString());
  const [startDay, setStartDay] = useState("0"); // 0=Sunday, 1=Monday
  const [viewFilter, setViewFilter] = useState<"all" | "done" | "not_done">("all");
  const [colorBy, setColorBy] = useState<"priority" | "decision">("priority");

  const numYear = parseInt(year);
  const numMonth = parseInt(month);
  const startDayNum = parseInt(startDay);

  // Get all tasks for the month
  const monthTasks = useMemo(() => {
    const prefix = `${year}-${String(numMonth + 1).padStart(2, "0")}`;
    let all = tasks.filter(t => {
      return (t.due_date && t.due_date.startsWith(prefix)) || (t.start_date && t.start_date.startsWith(prefix));
    });
    // Add recurring schedule
    const recurring = schedule.filter(s => s.occurrence_date.startsWith(prefix)).map(s => ({
      id: s.id,
      task_name: s.task_name || "",
      due_date: s.occurrence_date,
      is_completed: s.is_done,
      priority: (s.override_priority || s.priority || "Medium") as any,
      decision: (s.override_decision || s.decision || "To Decide") as any,
      status: s.is_done ? "Completed" : "To do",
    }));

    let combined = [...all.map(t => ({
      id: t.id, task_name: t.task_name, due_date: t.due_date || t.start_date || "",
      is_completed: t.is_completed, priority: t.priority, decision: t.decision, status: t.status,
    })), ...recurring];

    if (viewFilter === "done") combined = combined.filter(t => t.is_completed);
    if (viewFilter === "not_done") combined = combined.filter(t => !t.is_completed);
    return combined;
  }, [tasks, schedule, year, numMonth, viewFilter]);

  // Calendar grid
  const calendarGrid = useMemo(() => {
    const firstOfMonth = new Date(numYear, numMonth, 1);
    const lastOfMonth = new Date(numYear, numMonth + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const firstDayOfWeek = firstOfMonth.getDay();

    // Adjust for start day
    let offset = firstDayOfWeek - startDayNum;
    if (offset < 0) offset += 7;

    const weeks: { day: number | null; date: string }[][] = [];
    let currentWeek: { day: number | null; date: string }[] = [];

    // Empty cells before first day
    for (let i = 0; i < offset; i++) currentWeek.push({ day: null, date: "" });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(numMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      currentWeek.push({ day: d, date: dateStr });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push({ day: null, date: "" });
      weeks.push(currentWeek);
    }

    return weeks;
  }, [numYear, numMonth, startDayNum, year]);

  // Day headers adjusted for start day
  const headers = useMemo(() => {
    const h = [];
    for (let i = 0; i < 7; i++) h.push(dayShort[(startDayNum + i) % 7]);
    return h;
  }, [startDayNum]);

  // Today
  const todayStr = now.toISOString().split("T")[0];

  // Monthly progress
  const doneCount = monthTasks.filter(t => t.is_completed).length;
  const totalCount = monthTasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Get color class for a task
  const getTaskColor = (task: { priority: string; decision: string }) => {
    if (colorBy === "priority") return getPriorityColor(task.priority as any);
    return getDecisionColor(task.decision as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-teal-600" /> Monthly Calendar
          </h1>
          <p className="text-sm text-muted-foreground">View all tasks for the month</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMonthlyCalendarPdf(tasks, schedule, numYear, numMonth)}
          >
            <Download className="mr-1 h-4 w-4" /> Export PDF
          </Button>
          <Badge variant="outline">Today: {todayStr}</Badge>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <Label className="text-xs">Year</Label>
              <Input type="number" className="h-8 text-xs" value={year} onChange={e => setYear(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monthNames.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Start Day</Label>
              <Select value={startDay} onValueChange={setStartDay}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dayNames.map((d, i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">View Only</Label>
              <Select value={viewFilter} onValueChange={v => setViewFilter(v as any)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="done">Done Only</SelectItem>
                  <SelectItem value="not_done">Not Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Color Legend</Label>
              <Select value={colorBy} onValueChange={v => setColorBy(v as any)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Monthly Progress */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-medium">Monthly Progress:</span>
            <Progress value={progressPct} className="h-2 flex-1 max-w-xs" />
            <span className="text-xs font-bold text-teal-700">{progressPct}% ({doneCount}/{totalCount})</span>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="rounded-xl border overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          {headers.map((d, i) => (
            <div key={i} className="px-2 py-2 text-center text-xs font-bold uppercase">{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {calendarGrid.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 border-t">
            {week.map((cell, cIdx) => {
              if (!cell.day) return <div key={cIdx} className="min-h-[100px] bg-muted/20 border-r last:border-r-0" />;

              const dayTasks = monthTasks.filter(t => t.due_date === cell.date);
              const isToday = cell.date === todayStr;

              return (
                <div
                  key={cIdx}
                  className={`min-h-[100px] border-r last:border-r-0 p-1.5 ${
                    isToday ? "bg-teal-50 ring-2 ring-inset ring-teal-400" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isToday ? "text-teal-700" : "text-muted-foreground"}`}>
                      {cell.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] bg-teal-100 text-teal-700 rounded px-1">{dayTasks.length}</span>
                    )}
                  </div>
                  <div className="space-y-0.5 max-h-[70px] overflow-y-auto">
                    {dayTasks.slice(0, 4).map(t => (
                      <div
                        key={t.id}
                        className={`rounded px-1 py-0.5 text-[9px] leading-tight truncate border ${getTaskColor(t)}`}
                      >
                        {t.is_completed && <span className="mr-0.5">✓</span>}
                        {t.task_name}
                      </div>
                    ))}
                    {dayTasks.length > 4 && (
                      <span className="text-[9px] text-muted-foreground">+{dayTasks.length - 4} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-medium mb-2">Legend ({colorBy === "priority" ? "Priority" : "Decision"}):</p>
          <div className="flex flex-wrap gap-2">
            {colorBy === "priority" ? (
              <>
                {["Very High", "High", "Medium", "Low", "Very Low", "On Hold"].map(p => (
                  <Badge key={p} className={`text-[10px] ${getPriorityColor(p as any)}`}>{p}</Badge>
                ))}
              </>
            ) : (
              <>
                {["To Do", "To Decide", "To Delegate", "To Delete"].map(d => (
                  <Badge key={d} className={`text-[10px] ${getDecisionColor(d as any)}`}>{d}</Badge>
                ))}
              </>
            )}
            <Badge variant="outline" className="text-[10px]">✓ = Completed</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerMonthly;
