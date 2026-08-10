import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link2, Plus, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import type { VariableTask } from "./types";

export type Dependency = {
  id: string;
  predecessor_id: string;
  successor_id: string;
  type: "finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish";
};

type Props = {
  tasks: VariableTask[];
  dependencies: Dependency[];
  onAdd: (dep: Omit<Dependency, "id">) => void;
  onRemove: (id: string) => void;
};

/**
 * Task Dependencies management component for Gantt chart.
 * Allows linking tasks as predecessor/successor relationships.
 */
const TaskDependencies = ({ tasks, dependencies, onAdd, onRemove }: Props) => {
  const [predecessorId, setPredecessorId] = useState("");
  const [successorId, setSuccessorId] = useState("");
  const [depType, setDepType] = useState<Dependency["type"]>("finish-to-start");

  const tasksWithDates = tasks.filter(t => t.start_date && t.due_date);

  const addDependency = () => {
    if (!predecessorId || !successorId) { toast.error("Select both tasks"); return; }
    if (predecessorId === successorId) { toast.error("A task can't depend on itself"); return; }
    // Check for duplicate
    const exists = dependencies.some(d => d.predecessor_id === predecessorId && d.successor_id === successorId);
    if (exists) { toast.error("This dependency already exists"); return; }
    // Check for circular dependency
    if (wouldCreateCircle(predecessorId, successorId, dependencies)) {
      toast.error("This would create a circular dependency!");
      return;
    }

    onAdd({ predecessor_id: predecessorId, successor_id: successorId, type: depType });
    toast.success("Dependency added");
    setPredecessorId("");
    setSuccessorId("");
  };

  // Simple circular dependency check
  const wouldCreateCircle = (pred: string, succ: string, deps: Dependency[]): boolean => {
    const visited = new Set<string>();
    const queue = [pred];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === succ) return false; // This direction is fine
      if (visited.has(current)) continue;
      visited.add(current);
      // Check if succ eventually leads back to pred
      deps.filter(d => d.predecessor_id === succ).forEach(d => {
        if (d.successor_id === pred) return true;
      });
    }
    // Check reverse: does succ -> ... -> pred exist?
    const reverseVisited = new Set<string>();
    const reverseQueue = [succ];
    while (reverseQueue.length > 0) {
      const current = reverseQueue.shift()!;
      if (current === pred) return true;
      if (reverseVisited.has(current)) continue;
      reverseVisited.add(current);
      deps.filter(d => d.predecessor_id === current).forEach(d => reverseQueue.push(d.successor_id));
    }
    return false;
  };

  const getTaskName = (id: string) => tasks.find(t => t.id === id)?.task_name || "Unknown";

  const typeLabels: Record<Dependency["type"], string> = {
    "finish-to-start": "Finish → Start (FS)",
    "start-to-start": "Start → Start (SS)",
    "finish-to-finish": "Finish → Finish (FF)",
    "start-to-finish": "Start → Finish (SF)",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Link2 className="h-4 w-4 text-teal-600" /> Task Dependencies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new dependency */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
          <div>
            <Label className="text-[10px]">Predecessor (must finish first)</Label>
            <Select value={predecessorId} onValueChange={setPredecessorId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select task..." /></SelectTrigger>
              <SelectContent>
                {tasksWithDates.map(t => <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px]">Dependency Type</Label>
            <Select value={depType} onValueChange={v => setDepType(v as Dependency["type"])}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px]">Successor (depends on above)</Label>
            <Select value={successorId} onValueChange={setSuccessorId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select task..." /></SelectTrigger>
              <SelectContent>
                {tasksWithDates.filter(t => t.id !== predecessorId).map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={addDependency} className="h-8 bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        </div>

        {/* Existing dependencies */}
        {dependencies.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">
            No dependencies defined. Link tasks to show relationships on the Gantt chart.
          </p>
        ) : (
          <div className="space-y-1.5">
            {dependencies.map(dep => (
              <div key={dep.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs hover:bg-muted/30">
                <Badge variant="outline" className="text-[9px] max-w-[120px] truncate">{getTaskName(dep.predecessor_id)}</Badge>
                <ArrowRight className="h-3 w-3 text-teal-500 shrink-0" />
                <Badge variant="outline" className="text-[9px] max-w-[120px] truncate">{getTaskName(dep.successor_id)}</Badge>
                <Badge variant="secondary" className="text-[8px] shrink-0">{dep.type}</Badge>
                <Button size="icon" variant="ghost" className="h-5 w-5 ml-auto text-red-400 hover:text-red-600" onClick={() => onRemove(dep.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Warning */}
        {dependencies.length > 0 && (
          <div className="flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
            <span>Dependencies are shown as arrows on the Gantt chart. A successor task can't start before its predecessor finishes (FS type).</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskDependencies;
