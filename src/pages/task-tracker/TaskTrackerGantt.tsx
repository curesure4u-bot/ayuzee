import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart3 as GanttIcon, Plus, Calendar, Download } from "lucide-react";
import type { VariableTask, TaskTrackerSettings } from "./types";
import { getDaysLeft, getPriorityColor } from "./types";
import { exportGanttPdf } from "./exportPdf";

type Props = {
  tasks: VariableTask[];
  settings: TaskTrackerSettings;
  onUpdate: (id: string, updates: Partial<VariableTask>) => void;
};

const GANTT_COLORS = [
  { name: "Teal", value: "#0d9488" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Green", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
];

const TaskTrackerGantt = ({ tasks, settings, onUpdate }: Props) => {
  const [projectName, setProjectName] = useState("My Project");
  const [projectManager, setProjectManager] = useState(settings.people_in_charge[0] || "Self");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
    tasks.filter(t => t.start_date && t.due_date).slice(0, 8).map(t => t.id)
  );

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Get selected tasks with dates
  const ganttTasks = useMemo(() => {
    return tasks
      .filter(t => selectedTaskIds.includes(t.id) && t.start_date && t.due_date)
      .map(t => {
        const start = new Date(t.start_date!);
        const end = new Date(t.due_date!);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const daysLeft = getDaysLeft(t.due_date);

        // Calculate work days (exclude weekends based on settings)
        let workDays = 0;
        const cur = new Date(start);
        while (cur <= end) {
          const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][cur.getDay()];
          if (settings.working_days[dayName]) workDays++;
          cur.setDate(cur.getDate() + 1);
        }

        // Status logic
        let status = "In Progress";
        if (t.progress >= 100 || t.is_completed) status = "Completed";
        else if (!t.start_date || new Date(t.start_date) > today) status = "Not Started";
        else if (t.due_date && new Date(t.due_date) < today && t.progress < 100) status = "Delayed";
        else if (t.priority === "On Hold") status = "On Hold";
        else if (t.progress === 0 && !t.start_date) status = "Pending";

        // Delayed days
        const delayedDays = (daysLeft !== null && daysLeft < 0) ? Math.abs(daysLeft) : 0;

        return {
          ...t,
          duration,
          workDays,
          daysLeft: daysLeft || 0,
          ganttStatus: status,
          delayedDays,
        };
      })
      .sort((a, b) => (a.start_date || "").localeCompare(b.start_date || ""));
  }, [tasks, selectedTaskIds, settings.working_days]);

  // Overall project dates
  const projectStart = ganttTasks.length > 0 ? ganttTasks[0].start_date : todayStr;
  const projectEnd = ganttTasks.length > 0 ? ganttTasks.reduce((max, t) => t.due_date! > max ? t.due_date! : max, ganttTasks[0].due_date!) : todayStr;
  const projectDuration = projectStart && projectEnd ? Math.ceil((new Date(projectEnd).getTime() - new Date(projectStart!).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const projectDaysLeft = getDaysLeft(projectEnd);
  const overallProgress = ganttTasks.length > 0 ? Math.round(ganttTasks.reduce((sum, t) => sum + t.progress, 0) / ganttTasks.length) : 0;

  // Generate week columns for the timeline
  const weekColumns = useMemo(() => {
    if (!projectStart || !projectEnd) return [];
    const start = new Date(projectStart);
    const end = new Date(projectEnd);
    end.setDate(end.getDate() + 7); // Add buffer
    const weeks: { start: Date; end: Date; label: string }[] = [];
    const current = new Date(start);
    // Align to Monday
    current.setDate(current.getDate() - current.getDay() + 1);

    let weekNum = 1;
    while (current <= end) {
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const monthName = current.toLocaleString("default", { month: "short" });
      weeks.push({
        start: new Date(current),
        end: weekEnd,
        label: `Week ${weekNum}`,
      });
      current.setDate(current.getDate() + 7);
      weekNum++;
    }
    return weeks.slice(0, 12); // Max 12 weeks visible
  }, [projectStart, projectEnd]);

  // Calculate bar position
  const getBarStyle = (task: typeof ganttTasks[0]) => {
    if (!task.start_date || !task.due_date || weekColumns.length === 0) return { left: "0%", width: "0%" };
    const timelineStart = weekColumns[0].start.getTime();
    const timelineEnd = weekColumns[weekColumns.length - 1].end.getTime();
    const totalRange = timelineEnd - timelineStart;

    const taskStart = new Date(task.start_date).getTime();
    const taskEnd = new Date(task.due_date).getTime();

    const left = Math.max(0, ((taskStart - timelineStart) / totalRange) * 100);
    const width = Math.min(100 - left, ((taskEnd - taskStart) / totalRange) * 100);

    return { left: `${left}%`, width: `${Math.max(width, 1)}%` };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500";
      case "In Progress": return "bg-blue-500";
      case "Delayed": return "bg-red-500";
      case "On Hold": return "bg-amber-500";
      case "Not Started": return "bg-gray-400";
      default: return "bg-gray-300";
    }
  };

  const toggleTask = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <GanttIcon className="h-6 w-6 text-teal-600" /> Gantt Chart
          </h1>
          <p className="text-sm text-muted-foreground">Visualize project timelines with task durations</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportGanttPdf(tasks.filter(t => selectedTaskIds.includes(t.id)), projectName, projectManager)}
        >
          <Download className="mr-1 h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Project Header */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7 items-end">
            <div>
              <Label className="text-xs">Project Name</Label>
              <Input className="h-8 text-xs" value={projectName} onChange={e => setProjectName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Project Manager</Label>
              <Select value={projectManager} onValueChange={setProjectManager}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {settings.people_in_charge.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Start Date</p>
              <p className="text-xs font-bold">{projectStart}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">End Date</p>
              <p className="text-xs font-bold">{projectEnd}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Duration</p>
              <p className="text-xs font-bold">{projectDuration} days</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Today</p>
              <p className="text-xs font-bold">{todayStr}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Days Left</p>
              <p className={`text-xs font-bold ${(projectDaysLeft || 0) < 0 ? "text-red-600" : "text-green-600"}`}>{projectDaysLeft}</p>
            </div>
          </div>
          {/* Overall Progress */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-xs font-medium">Overall Project Progress:</span>
            <div className="h-14 w-14">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[{ v: overallProgress }, { v: 100 - overallProgress }]} innerRadius={16} outerRadius={24} dataKey="v" startAngle={90} endAngle={-270}>
                    <Cell fill="#0d9488" /><Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <span className="text-lg font-bold text-teal-700">{overallProgress}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Task Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Select Tasks for Gantt (requires start & due dates)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {tasks.filter(t => t.start_date && t.due_date).map(t => (
              <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer rounded border p-1.5 hover:bg-muted/50">
                <Checkbox checked={selectedTaskIds.includes(t.id)} onCheckedChange={() => toggleTask(t.id)} />
                <span className="truncate">{t.task_name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gantt Table + Chart */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header row */}
            <div className="grid grid-cols-[300px_1fr] border-b bg-muted/50">
              <div className="grid grid-cols-[30px_1fr_50px_80px_60px_60px_60px_50px_50px] gap-0 text-[9px] font-bold text-teal-700 px-1 py-2">
                <span></span>
                <span>Task</span>
                <span>Progress</span>
                <span>Date Range</span>
                <span>Duration</span>
                <span>Work Days</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Days Left</span>
              </div>
              <div className="flex border-l">
                {weekColumns.map((w, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] font-medium text-muted-foreground border-r py-2">
                    {w.label}
                    <br />
                    <span className="text-[8px]">{w.start.toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            {ganttTasks.map((task, idx) => {
              const barStyle = getBarStyle(task);
              const barColor = GANTT_COLORS[idx % GANTT_COLORS.length].value;

              return (
                <div key={task.id} className="grid grid-cols-[300px_1fr] border-b hover:bg-muted/20">
                  {/* Task info columns */}
                  <div className="grid grid-cols-[30px_1fr_50px_80px_60px_60px_60px_50px_50px] gap-0 text-[9px] px-1 py-2 items-center">
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() => onUpdate(task.id, { is_completed: !task.is_completed })}
                      className="h-3 w-3"
                    />
                    <span className="font-medium truncate pr-1">{task.task_name}</span>
                    <span>{task.progress}%</span>
                    <span className="text-muted-foreground">{task.start_date?.slice(5)} ~ {task.due_date?.slice(5)}</span>
                    <span>{task.duration}d</span>
                    <span>{task.workDays}d</span>
                    <Badge className={`text-[8px] px-0.5 ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                    <Badge className={`text-[8px] px-0.5 ${getStatusColor(task.ganttStatus)} text-white`}>{task.ganttStatus.slice(0, 4)}</Badge>
                    <span className={task.daysLeft < 0 ? "text-red-600 font-bold" : ""}>{task.daysLeft}</span>
                  </div>
                  {/* Gantt bar */}
                  <div className="relative border-l py-2 px-1">
                    <div className="absolute inset-y-0 flex items-center w-full px-1">
                      <div
                        className="h-5 rounded-full opacity-80 flex items-center px-1 relative"
                        style={{ marginLeft: barStyle.left, width: barStyle.width, backgroundColor: barColor }}
                      >
                        {/* Progress fill */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full opacity-40 bg-white"
                          style={{ width: `${100 - task.progress}%`, right: 0, left: "auto" }}
                        />
                        <span className="text-[8px] text-white font-bold relative z-10 truncate">{task.task_name}</span>
                      </div>
                    </div>
                    {/* Week grid lines */}
                    <div className="flex h-full">
                      {weekColumns.map((_, i) => (
                        <div key={i} className="flex-1 border-r border-dashed border-gray-200" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3 items-center text-xs">
            <span className="font-medium">Status Legend:</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-500" /> Completed</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500" /> In Progress</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500" /> Delayed</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500" /> On Hold</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-gray-400" /> Not Started</span>
            <span className="flex items-center gap-1 ml-4"><Calendar className="h-3 w-3 text-teal-600" /> Today: {todayStr}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerGantt;
