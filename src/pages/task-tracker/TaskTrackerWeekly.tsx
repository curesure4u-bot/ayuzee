import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CalendarRange, CheckCircle } from "lucide-react";
import type { VariableTask, ScheduleOccurrence } from "./types";
import { getPriorityColor, getDecisionColor } from "./types";

type Props = {
  tasks: VariableTask[];
  schedule: ScheduleOccurrence[];
};

const dayFullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TaskTrackerWeekly = ({ tasks, schedule }: Props) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear().toString());
  const [month, setMonth] = useState(now.getMonth().toString());
  const [startDayOfMonth, setStartDayOfMonth] = useState(
    (now.getDate() - now.getDay()).toString() // Start of current week
  );
  const [viewFilter, setViewFilter] = useState<"all" | "done" | "not_done">("all");
  const [colorBy, setColorBy] = useState<"priority" | "decision">("priority");

  // Generate 7 days starting from the selected date
  const weekDays = useMemo(() => {
    const startDate = new Date(parseInt(year), parseInt(month), parseInt(startDayOfMonth) || 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({
        date: d.toISOString().split("T")[0],
        dayName: dayFullNames[d.getDay()],
        dayNum: d.getDate(),
        monthName: monthNames[d.getMonth()],
        fullLabel: `${dayFullNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      });
    }
    return days;
  }, [year, month, startDayOfMonth]);

  // Get tasks for each day
  const getTasksForDate = (dateStr: string) => {
    let dayTasks = tasks.filter(t => t.due_date === dateStr || t.start_date === dateStr);
    const recurTasks = schedule.filter(s => s.occurrence_date === dateStr).map(s => ({
      id: s.id,
      task_name: s.task_name || "",
      is_completed: s.is_done,
      priority: (s.override_priority || s.priority || "Medium") as any,
      decision: (s.override_decision || s.decision || "To Decide") as any,
      status: s.is_done ? "Completed" : "To do",
    }));

    let combined = [
      ...dayTasks.map(t => ({ id: t.id, task_name: t.task_name, is_completed: t.is_completed, priority: t.priority, decision: t.decision, status: t.status })),
      ...recurTasks,
    ];

    if (viewFilter === "done") combined = combined.filter(t => t.is_completed);
    if (viewFilter === "not_done") combined = combined.filter(t => !t.is_completed);
    return combined;
  };

  // Day progress
  const getDayProgress = (dateStr: string) => {
    const dayTasks = getTasksForDate(dateStr);
    if (dayTasks.length === 0) return 0;
    return Math.round((dayTasks.filter(t => t.is_completed).length / dayTasks.length) * 100);
  };

  const todayStr = now.toISOString().split("T")[0];

  // Column colors for headers
  const colColors = [
    "from-red-500 to-red-600",
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-amber-500 to-amber-600",
    "from-teal-500 to-teal-600",
    "from-pink-500 to-pink-600",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-teal-600" /> Weekly Calendar
          </h1>
          <p className="text-sm text-muted-foreground">7-day view with daily progress</p>
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
              <Input type="number" min={1} max={31} className="h-8 text-xs" value={startDayOfMonth} onChange={e => setStartDayOfMonth(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">View</Label>
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
              <Label className="text-xs">Color By</Label>
              <Select value={colorBy} onValueChange={v => setColorBy(v as any)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress Rings */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const pct = getDayProgress(day.date);
          return (
            <div key={day.date} className="text-center">
              <div className="h-16 w-16 mx-auto">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[{ v: pct }, { v: 100 - pct }]}
                      innerRadius={20} outerRadius={28}
                      dataKey="v" startAngle={90} endAngle={-270}
                    >
                      <Cell fill={pct === 100 ? "#10b981" : pct > 0 ? "#0d9488" : "#e5e7eb"} />
                      <Cell fill="#f3f4f6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-[10px] font-bold">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const dayTasks = getTasksForDate(day.date);
          const isToday = day.date === todayStr;

          return (
            <div key={day.date} className={`rounded-xl border overflow-hidden ${isToday ? "ring-2 ring-teal-400" : ""}`}>
              {/* Day Header */}
              <div className={`bg-gradient-to-r ${colColors[i]} px-2 py-2 text-center`}>
                <p className="text-[9px] font-medium text-white/80">{day.dayName}, {day.monthName} {day.dayNum}, {year}</p>
              </div>

              {/* Tasks */}
              <div className="p-2 space-y-1 min-h-[180px] max-h-[300px] overflow-y-auto bg-white">
                {dayTasks.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-4">No tasks</p>
                ) : dayTasks.map(t => (
                  <div
                    key={t.id}
                    className={`rounded px-1.5 py-1 text-[10px] border ${
                      colorBy === "priority" ? getPriorityColor(t.priority) : getDecisionColor(t.decision)
                    } ${t.is_completed ? "opacity-60 line-through" : ""}`}
                  >
                    <div className="flex items-start gap-1">
                      {t.is_completed && <CheckCircle className="h-2.5 w-2.5 text-green-500 shrink-0 mt-0.5" />}
                      <span className="leading-tight">{t.task_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium">Legend:</span>
            {colorBy === "priority" ? (
              ["Very High", "High", "Medium", "Low", "Very Low", "On Hold"].map(p => (
                <Badge key={p} className={`text-[10px] ${getPriorityColor(p as any)}`}>{p}</Badge>
              ))
            ) : (
              ["To Do", "To Decide", "To Delegate", "To Delete"].map(d => (
                <Badge key={d} className={`text-[10px] ${getDecisionColor(d as any)}`}>{d}</Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerWeekly;
