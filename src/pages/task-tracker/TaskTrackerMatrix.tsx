import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Target, CheckCircle } from "lucide-react";
import type { VariableTask, Decision } from "./types";

type Props = {
  tasks: VariableTask[];
};

const TaskTrackerMatrix = ({ tasks }: Props) => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [viewOnly, setViewOnly] = useState<"all" | "done" | "not_done">("all");

  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Filter tasks by month
  const monthTasks = useMemo(() => {
    const prefix = `${year}-${month}`;
    let result = tasks.filter(t => {
      const date = t.due_date || t.start_date || "";
      return date.startsWith(prefix);
    });
    if (viewOnly === "done") result = result.filter(t => t.is_completed);
    if (viewOnly === "not_done") result = result.filter(t => !t.is_completed);
    return result;
  }, [tasks, year, month, viewOnly]);

  const totalCompleted = monthTasks.filter(t => t.is_completed).length;
  const totalActive = monthTasks.length;
  const completionPct = totalActive > 0 ? Math.round((totalCompleted / totalActive) * 100) : 0;

  // Group by decision
  const quadrants: Record<Decision, VariableTask[]> = {
    "To Do": monthTasks.filter(t => t.decision === "To Do"),
    "To Decide": monthTasks.filter(t => t.decision === "To Decide"),
    "To Delegate": monthTasks.filter(t => t.decision === "To Delegate"),
    "To Delete": monthTasks.filter(t => t.decision === "To Delete"),
  };

  const quadrantConfig: { key: Decision; label: string; description: string; bgColor: string; textColor: string; borderColor: string }[] = [
    {
      key: "To Do", label: "DO", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200",
      description: "Tasks that require immediate attention and contribute to your goals. Focus on deadlines.",
    },
    {
      key: "To Decide", label: "DECIDE", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200",
      description: "Tasks that are key to long-term success but have no immediate urgency. Schedule these wisely.",
    },
    {
      key: "To Delegate", label: "DELEGATE", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200",
      description: "Tasks that require immediate attention but don't need your personal involvement. Delegate them.",
    },
    {
      key: "To Delete", label: "DELETE", bgColor: "bg-gray-50", textColor: "text-gray-600", borderColor: "border-gray-200",
      description: "Tasks that have little to no value and do not contribute to goals. Eliminate distractions.",
    },
  ];

  // Completion per quadrant
  const quadrantCompletion = (key: Decision) => {
    const q = quadrants[key];
    if (q.length === 0) return 0;
    return Math.round((q.filter(t => t.is_completed).length / q.length) * 100);
  };

  // Progress bars
  const progressData = [
    { label: "To Do", pct: totalActive > 0 ? Math.round((quadrants["To Do"].length / totalActive) * 100) : 0, color: "bg-red-500" },
    { label: "To Delegate", pct: totalActive > 0 ? Math.round((quadrants["To Delegate"].length / totalActive) * 100) : 0, color: "bg-blue-500" },
    { label: "To Decide", pct: totalActive > 0 ? Math.round((quadrants["To Decide"].length / totalActive) * 100) : 0, color: "bg-amber-500" },
    { label: "To Delete", pct: totalActive > 0 ? Math.round((quadrants["To Delete"].length / totalActive) * 100) : 0, color: "bg-gray-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" /> Decision Matrix
          </h1>
          <p className="text-sm text-muted-foreground">Eisenhower matrix — prioritize by importance & urgency</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">Year</Label>
          <Input type="number" className="w-24 h-8 text-xs" value={year} onChange={e => setYear(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m, i) => <SelectItem key={m} value={m}>{monthNames[i]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">View</Label>
          <Select value={viewOnly} onValueChange={v => setViewOnly(v as any)}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="done">Done Only</SelectItem>
              <SelectItem value="not_done">Not Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="h-8 px-3">
          {totalCompleted} / {totalActive} tasks completed
        </Badge>
      </div>

      {/* Matrix Labels */}
      <div className="grid grid-cols-[80px_1fr_1fr] gap-2">
        <div></div>
        <div className="text-center text-xs font-bold text-red-600 uppercase">Urgent</div>
        <div className="text-center text-xs font-bold text-amber-600 uppercase">Not Urgent</div>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
        {/* Row 1: Important */}
        <div className="flex items-center">
          <span className="text-xs font-bold text-green-700 [writing-mode:vertical-rl] rotate-180">Important</span>
        </div>
        {/* DO - Important + Urgent */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-sm text-red-700 flex items-center justify-between">
              Do
              <Badge className="bg-red-100 text-red-700 text-[10px]">{quadrants["To Do"].length} tasks</Badge>
            </CardTitle>
            <p className="text-[10px] text-red-600/80">{quadrantConfig[0].description}</p>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-16 w-16">
                <ResponsiveContainer>
                  <PieChart><Pie data={[{ v: quadrantCompletion("To Do") }, { v: 100 - quadrantCompletion("To Do") }]} innerRadius={18} outerRadius={28} dataKey="v" startAngle={90} endAngle={-270}>
                    <Cell fill="#dc2626" /><Cell fill="#fecaca" />
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-lg font-bold text-red-700">{quadrantCompletion("To Do")}%</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {quadrants["To Do"].map(t => (
                <div key={t.id} className="flex items-center gap-1 text-[10px] py-0.5 border-b border-red-100 last:border-0">
                  {t.is_completed && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                  <span className="truncate">{t.task_name}</span>
                  <span className="ml-auto text-red-400 shrink-0">{t.due_date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DECIDE - Important + Not Urgent */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-sm text-amber-700 flex items-center justify-between">
              Decide
              <Badge className="bg-amber-100 text-amber-700 text-[10px]">{quadrants["To Decide"].length} tasks</Badge>
            </CardTitle>
            <p className="text-[10px] text-amber-600/80">{quadrantConfig[1].description}</p>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-16 w-16">
                <ResponsiveContainer>
                  <PieChart><Pie data={[{ v: quadrantCompletion("To Decide") }, { v: 100 - quadrantCompletion("To Decide") }]} innerRadius={18} outerRadius={28} dataKey="v" startAngle={90} endAngle={-270}>
                    <Cell fill="#d97706" /><Cell fill="#fef3c7" />
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-lg font-bold text-amber-700">{quadrantCompletion("To Decide")}%</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {quadrants["To Decide"].map(t => (
                <div key={t.id} className="flex items-center gap-1 text-[10px] py-0.5 border-b border-amber-100 last:border-0">
                  {t.is_completed && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                  <span className="truncate">{t.task_name}</span>
                  <span className="ml-auto text-amber-400 shrink-0">{t.due_date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Row 2: Not Important */}
        <div className="flex items-center">
          <span className="text-xs font-bold text-gray-500 [writing-mode:vertical-rl] rotate-180">Not Important</span>
        </div>

        {/* DELEGATE - Not Important + Urgent */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-sm text-blue-700 flex items-center justify-between">
              Delegate
              <Badge className="bg-blue-100 text-blue-700 text-[10px]">{quadrants["To Delegate"].length} tasks</Badge>
            </CardTitle>
            <p className="text-[10px] text-blue-600/80">{quadrantConfig[2].description}</p>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-16 w-16">
                <ResponsiveContainer>
                  <PieChart><Pie data={[{ v: quadrantCompletion("To Delegate") }, { v: 100 - quadrantCompletion("To Delegate") }]} innerRadius={18} outerRadius={28} dataKey="v" startAngle={90} endAngle={-270}>
                    <Cell fill="#2563eb" /><Cell fill="#dbeafe" />
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-lg font-bold text-blue-700">{quadrantCompletion("To Delegate")}%</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {quadrants["To Delegate"].map(t => (
                <div key={t.id} className="flex items-center gap-1 text-[10px] py-0.5 border-b border-blue-100 last:border-0">
                  {t.is_completed && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                  <span className="truncate">{t.task_name}</span>
                  <span className="ml-auto text-blue-400 shrink-0">{t.due_date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DELETE - Not Important + Not Urgent */}
        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-sm text-gray-600 flex items-center justify-between">
              Delete
              <Badge className="bg-gray-100 text-gray-600 text-[10px]">{quadrants["To Delete"].length} tasks</Badge>
            </CardTitle>
            <p className="text-[10px] text-gray-500/80">{quadrantConfig[3].description}</p>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-16 w-16">
                <ResponsiveContainer>
                  <PieChart><Pie data={[{ v: quadrantCompletion("To Delete") }, { v: 100 - quadrantCompletion("To Delete") }]} innerRadius={18} outerRadius={28} dataKey="v" startAngle={90} endAngle={-270}>
                    <Cell fill="#6b7280" /><Cell fill="#e5e7eb" />
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-lg font-bold text-gray-600">{quadrantCompletion("To Delete")}%</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {quadrants["To Delete"].map(t => (
                <div key={t.id} className="flex items-center gap-1 text-[10px] py-0.5 border-b border-gray-100 last:border-0">
                  {t.is_completed && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                  <span className="truncate">{t.task_name}</span>
                  <span className="ml-auto text-gray-400 shrink-0">{t.due_date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Overall Progress by Quadrant</p>
          <div className="space-y-2">
            {progressData.map(p => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-xs w-24">{p.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-xs font-medium w-10 text-right">{p.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerMatrix;
