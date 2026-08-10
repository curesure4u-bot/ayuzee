import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanSquare, ArrowUpDown, User, Calendar } from "lucide-react";
import type { VariableTask, TaskTrackerSettings } from "./types";
import { getPriorityColor } from "./types";

type Props = {
  tasks: VariableTask[];
  settings: TaskTrackerSettings;
  onUpdate: (id: string, updates: Partial<VariableTask>) => void;
};

const TaskTrackerKanban = ({ tasks, settings, onUpdate }: Props) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterDecision, setFilterDecision] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [progressFrom, setProgressFrom] = useState("");
  const [progressTo, setProgressTo] = useState("");

  const columns = settings.kanban_categories;

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filterStatus !== "all") result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== "all") result = result.filter(t => t.priority === filterPriority);
    if (filterPerson !== "all") result = result.filter(t => t.person_in_charge === filterPerson);
    if (filterDecision !== "all") result = result.filter(t => t.decision === filterDecision);
    if (progressFrom) result = result.filter(t => t.progress >= Number(progressFrom));
    if (progressTo) result = result.filter(t => t.progress <= Number(progressTo));

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "due_date") cmp = (a.due_date || "").localeCompare(b.due_date || "");
      else if (sortBy === "progress") cmp = a.progress - b.progress;
      else if (sortBy === "start_date") cmp = (a.start_date || "").localeCompare(b.start_date || "");
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [tasks, filterStatus, filterPriority, filterPerson, filterDecision, progressFrom, progressTo, sortBy, sortOrder]);

  const getColumnTasks = (category: string) => filteredTasks.filter(t => t.kanban_category === category);

  const moveTask = (taskId: string, newCategory: string) => {
    onUpdate(taskId, { kanban_category: newCategory });
  };

  const columnColors = ["bg-gray-50", "bg-blue-50", "bg-amber-50", "bg-purple-50", "bg-green-50"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-teal-600" /> Kanban Board
          </h1>
          <p className="text-sm text-muted-foreground">Visualize tasks by category — drag cards or use arrows to move</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <div>
              <Label className="text-[10px]">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {settings.statuses.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["Very High", "High", "Medium", "Low", "Very Low", "On Hold"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Person</Label>
              <Select value={filterPerson} onValueChange={setFilterPerson}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {settings.people_in_charge.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Decision</Label>
              <Select value={filterDecision} onValueChange={setFilterDecision}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["To Do", "To Decide", "To Delegate", "To Delete"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Progress From</Label>
              <Input type="number" min={0} max={100} className="h-8 text-xs" value={progressFrom} onChange={e => setProgressFrom(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-[10px]">Progress To</Label>
              <Input type="number" min={0} max={100} className="h-8 text-xs" value={progressTo} onChange={e => setProgressTo(e.target.value)} placeholder="100" />
            </div>
            <div>
              <Label className="text-[10px]">Sort</Label>
              <div className="flex gap-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due_date">Due Date</SelectItem>
                    <SelectItem value="start_date">Start Date</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Columns */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(200px, 1fr))` }}>
        {columns.map((col, colIdx) => {
          const colTasks = getColumnTasks(col);
          return (
            <div key={col} className={`rounded-xl border p-3 ${columnColors[colIdx % columnColors.length]}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide">{col}</h3>
                <Badge variant="secondary" className="text-[10px]">{colTasks.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {colTasks.map(task => (
                  <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      {/* Person avatar */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />{task.person_in_charge || "Unassigned"}
                        </span>
                        <Badge className={`text-[9px] px-1 ${getPriorityColor(task.priority)}`}>{task.priority.slice(0, 1)}</Badge>
                      </div>
                      {/* Task name */}
                      <p className="text-xs font-semibold leading-tight">{task.task_name}</p>
                      {/* Description snippet */}
                      {task.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <Progress value={task.progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-medium">{task.progress}%</span>
                      </div>
                      {/* Due date + Status */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />{task.due_date || "No date"}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1">{task.status}</Badge>
                      </div>
                      {/* Move buttons */}
                      <div className="flex gap-1 pt-1">
                        {colIdx > 0 && (
                          <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1" onClick={() => moveTask(task.id, columns[colIdx - 1])}>
                            ← {columns[colIdx - 1]}
                          </Button>
                        )}
                        {colIdx < columns.length - 1 && (
                          <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1 ml-auto" onClick={() => moveTask(task.id, columns[colIdx + 1])}>
                            {columns[colIdx + 1]} →
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTrackerKanban;
