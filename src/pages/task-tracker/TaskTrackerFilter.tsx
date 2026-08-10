import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VariableTask, ScheduleOccurrence, TaskTrackerSettings } from "./types";
import { getDaysLeft, getPriorityColor, getDecisionColor } from "./types";

type Props = {
  tasks: VariableTask[];
  schedule: ScheduleOccurrence[];
  settings: TaskTrackerSettings;
};

const TaskTrackerFilter = ({ tasks, schedule, settings }: Props) => {
  // Filters
  const [filterCompleted, setFilterCompleted] = useState<"all" | "yes" | "no">("all");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterKanban, setFilterKanban] = useState("all");
  const [filterImportance, setFilterImportance] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterDecision, setFilterDecision] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "variable" | "recurring">("all");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [daysLeftFilter, setDaysLeftFilter] = useState("");
  const [progressFrom, setProgressFrom] = useState("");
  const [progressTo, setProgressTo] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Combine variable + recurring into unified list
  const allTasks = useMemo(() => {
    const variable = tasks.map(t => ({
      ...t,
      type: "Variable" as const,
      days_left: getDaysLeft(t.due_date),
    }));

    const recurring = schedule.map(s => ({
      id: s.id,
      task_name: s.task_name || "",
      description: s.override_description || s.description || "",
      status: s.is_done ? "Completed" : "To do",
      priority: (s.override_priority || s.priority || "Medium") as any,
      person_in_charge: s.override_person || s.person_in_charge || "",
      start_date: s.occurrence_date,
      due_date: s.occurrence_date,
      kanban_category: "",
      importance: "Not Important" as const,
      urgency: "Not Urgent" as const,
      decision: (s.override_decision || s.decision || "To Decide") as any,
      progress: s.is_done ? 100 : 0,
      is_completed: s.is_done,
      notes: "",
      type: "Recurring" as const,
      days_left: getDaysLeft(s.occurrence_date),
    }));

    return [...variable, ...recurring];
  }, [tasks, schedule]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...allTasks];

    if (filterCompleted === "yes") result = result.filter(t => t.is_completed);
    if (filterCompleted === "no") result = result.filter(t => !t.is_completed);
    if (filterName) result = result.filter(t => t.task_name.toLowerCase().includes(filterName.toLowerCase()));
    if (filterStatus !== "all") result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== "all") result = result.filter(t => t.priority === filterPriority);
    if (filterPerson !== "all") result = result.filter(t => t.person_in_charge === filterPerson);
    if (filterKanban !== "all") result = result.filter(t => "kanban_category" in t && t.kanban_category === filterKanban);
    if (filterImportance !== "all") result = result.filter(t => "importance" in t && t.importance === filterImportance);
    if (filterUrgency !== "all") result = result.filter(t => "urgency" in t && t.urgency === filterUrgency);
    if (filterDecision !== "all") result = result.filter(t => t.decision === filterDecision);
    if (filterType !== "all") result = result.filter(t => t.type === (filterType === "variable" ? "Variable" : "Recurring"));
    if (startDateFrom) result = result.filter(t => (t.start_date || "") >= startDateFrom);
    if (startDateTo) result = result.filter(t => (t.start_date || "") <= startDateTo);
    if (dueDateFrom) result = result.filter(t => (t.due_date || "") >= dueDateFrom);
    if (dueDateTo) result = result.filter(t => (t.due_date || "") <= dueDateTo);
    if (daysLeftFilter) result = result.filter(t => t.days_left !== null && t.days_left <= Number(daysLeftFilter));
    if (progressFrom) result = result.filter(t => t.progress >= Number(progressFrom));
    if (progressTo) result = result.filter(t => t.progress <= Number(progressTo));

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "start_date": cmp = (a.start_date || "").localeCompare(b.start_date || ""); break;
        case "due_date": cmp = (a.due_date || "").localeCompare(b.due_date || ""); break;
        case "days_left": cmp = (a.days_left ?? 999) - (b.days_left ?? 999); break;
        case "progress": cmp = a.progress - b.progress; break;
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [allTasks, filterCompleted, filterName, filterStatus, filterPriority, filterPerson, filterKanban, filterImportance, filterUrgency, filterDecision, filterType, startDateFrom, startDateTo, dueDateFrom, dueDateTo, daysLeftFilter, progressFrom, progressTo, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Filter className="h-6 w-6 text-teal-600" /> Tasks Filter
        </h1>
        <p className="text-sm text-muted-foreground">Advanced filtering and sorting across all tasks</p>
      </div>

      {/* Filters Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <Label className="text-[10px] font-bold text-rose-600">COMPLETED TASK</Label>
              <Select value={filterCompleted} onValueChange={v => setFilterCompleted(v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Completed</SelectItem>
                  <SelectItem value="no">Not Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-orange-600">TASK NAME</Label>
              <Input className="h-7 text-xs" placeholder="Search..." value={filterName} onChange={e => setFilterName(e.target.value)} />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-yellow-600">STATUS</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {settings.statuses.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-green-600">PRIORITY</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["Very High", "High", "Medium", "Low", "Very Low", "On Hold"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-blue-600">PERSON IN CHARGE</Label>
              <Select value={filterPerson} onValueChange={setFilterPerson}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {settings.people_in_charge.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-teal-600">DAYS LEFT ≤</Label>
              <Input type="number" className="h-7 text-xs" placeholder="e.g. 7" value={daysLeftFilter} onChange={e => setDaysLeftFilter(e.target.value)} />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-purple-600">KANBAN CATEGORY</Label>
              <Select value={filterKanban} onValueChange={setFilterKanban}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {settings.kanban_categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-pink-600">IMPORTANCE</Label>
              <Select value={filterImportance} onValueChange={setFilterImportance}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Not Important">Not Important</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-amber-600">URGENCY</Label>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Not Urgent">Not Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-indigo-600">DECISION</Label>
              <Select value={filterDecision} onValueChange={setFilterDecision}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["To Do", "To Decide", "To Delegate", "To Delete"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-cyan-600">RECURRING / VARIABLE</Label>
              <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-gray-600">START DATE FROM</Label>
              <Input type="date" className="h-7 text-xs" value={startDateFrom} onChange={e => setStartDateFrom(e.target.value)} />
            </div>
          </div>

          {/* Sort Row */}
          <div className="mt-3 flex items-end gap-3 border-t pt-3">
            <div>
              <Label className="text-[10px] font-bold">SORT BY</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="start_date">Start Date</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="days_left">Days Left</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold">ORDER</Label>
              <Select value={sortOrder} onValueChange={v => setSortOrder(v as any)}>
                <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-bold">PROGRESS FROM</Label>
              <Input type="number" min={0} max={100} className="h-7 text-xs w-20" value={progressFrom} onChange={e => setProgressFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-[10px] font-bold">PROGRESS TO</Label>
              <Input type="number" min={0} max={100} className="h-7 text-xs w-20" value={progressTo} onChange={e => setProgressTo(e.target.value)} />
            </div>
            <Badge variant="outline" className="h-7 px-2">{filtered.length} results</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 w-6"></th>
                  <th className="px-2 py-2 text-left font-medium">Task Name</th>
                  <th className="px-2 py-2 text-left font-medium">Description</th>
                  <th className="px-2 py-2 text-left font-medium">Status</th>
                  <th className="px-2 py-2 text-left font-medium">Priority</th>
                  <th className="px-2 py-2 text-left font-medium">Person</th>
                  <th className="px-2 py-2 text-left font-medium">Start</th>
                  <th className="px-2 py-2 text-left font-medium">Due</th>
                  <th className="px-2 py-2 text-left font-medium">Days Left</th>
                  <th className="px-2 py-2 text-left font-medium">Kanban</th>
                  <th className="px-2 py-2 text-left font-medium">Importance</th>
                  <th className="px-2 py-2 text-left font-medium">Urgency</th>
                  <th className="px-2 py-2 text-left font-medium">Decision</th>
                  <th className="px-2 py-2 text-left font-medium">Progress</th>
                  <th className="px-2 py-2 text-left font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={15} className="py-8 text-center text-muted-foreground">No tasks match your filters</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className={`border-b hover:bg-muted/30 ${t.is_completed ? "opacity-50" : ""}`}>
                    <td className="px-2 py-1.5">
                      {t.is_completed && <span className="text-green-500">✓</span>}
                    </td>
                    <td className="px-2 py-1.5 font-medium max-w-[130px] truncate">{t.task_name}</td>
                    <td className="px-2 py-1.5 text-muted-foreground max-w-[100px] truncate">{t.description}</td>
                    <td className="px-2 py-1.5"><Badge variant="outline" className="text-[9px]">{t.status}</Badge></td>
                    <td className="px-2 py-1.5"><Badge className={`text-[9px] ${getPriorityColor(t.priority)}`}>{t.priority}</Badge></td>
                    <td className="px-2 py-1.5">{t.person_in_charge}</td>
                    <td className="px-2 py-1.5">{t.start_date || "—"}</td>
                    <td className="px-2 py-1.5">{t.due_date || "—"}</td>
                    <td className="px-2 py-1.5">
                      {t.days_left !== null && (
                        <span className={t.days_left < 0 ? "text-red-600 font-bold" : t.days_left <= 3 ? "text-amber-600" : ""}>{t.days_left}</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5">{"kanban_category" in t ? (t as any).kanban_category : "—"}</td>
                    <td className="px-2 py-1.5">{"importance" in t ? (t as any).importance : "—"}</td>
                    <td className="px-2 py-1.5">{"urgency" in t ? (t as any).urgency : "—"}</td>
                    <td className="px-2 py-1.5"><Badge className={`text-[9px] ${getDecisionColor(t.decision)}`}>{t.decision}</Badge></td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Progress value={t.progress} className="h-1.5 w-10" />
                        <span className="text-[9px]">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5"><Badge variant="secondary" className="text-[9px]">{t.type}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerFilter;
