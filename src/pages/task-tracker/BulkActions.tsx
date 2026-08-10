import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckSquare, Trash2, ArrowRight, Copy } from "lucide-react";
import type { VariableTask, Priority } from "./types";

type Props = {
  selectedIds: string[];
  tasks: VariableTask[];
  onUpdate: (id: string, updates: Partial<VariableTask>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: VariableTask) => void;
  onClearSelection: () => void;
};

/**
 * Bulk Actions bar — appears when tasks are selected.
 * Actions: change status, change priority, change person, mark done, delete, duplicate.
 */
const BulkActions = ({ selectedIds, tasks, onUpdate, onDelete, onDuplicate, onClearSelection }: Props) => {
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkPerson, setBulkPerson] = useState("");

  if (selectedIds.length === 0) return null;

  const applyBulkStatus = () => {
    if (!bulkStatus) return;
    selectedIds.forEach(id => onUpdate(id, { status: bulkStatus }));
    toast.success(`Status updated for ${selectedIds.length} tasks`);
    setBulkStatus("");
  };

  const applyBulkPriority = () => {
    if (!bulkPriority) return;
    selectedIds.forEach(id => onUpdate(id, { priority: bulkPriority as Priority }));
    toast.success(`Priority updated for ${selectedIds.length} tasks`);
    setBulkPriority("");
  };

  const markAllDone = () => {
    selectedIds.forEach(id => onUpdate(id, { is_completed: true, progress: 100, status: "Completed" }));
    toast.success(`${selectedIds.length} tasks marked complete`);
    onClearSelection();
  };

  const deleteAll = () => {
    selectedIds.forEach(id => onDelete(id));
    toast.success(`${selectedIds.length} tasks deleted`);
    onClearSelection();
  };

  const duplicateAll = () => {
    const selected = tasks.filter(t => selectedIds.includes(t.id));
    selected.forEach(t => onDuplicate(t));
    toast.success(`${selectedIds.length} tasks duplicated`);
    onClearSelection();
  };

  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 flex-wrap rounded-lg border bg-blue-50 border-blue-200 p-2 shadow-sm">
      <Badge variant="default" className="bg-blue-600">{selectedIds.length} selected</Badge>

      {/* Change Status */}
      <div className="flex gap-1 items-center">
        <Select value={bulkStatus} onValueChange={setBulkStatus}>
          <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue placeholder="Status..." /></SelectTrigger>
          <SelectContent>
            {["To do", "In progress", "Hold", "Completed", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {bulkStatus && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={applyBulkStatus}><ArrowRight className="h-3 w-3" /></Button>}
      </div>

      {/* Change Priority */}
      <div className="flex gap-1 items-center">
        <Select value={bulkPriority} onValueChange={setBulkPriority}>
          <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue placeholder="Priority..." /></SelectTrigger>
          <SelectContent>
            {["Very High", "High", "Medium", "Low", "Very Low"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        {bulkPriority && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={applyBulkPriority}><ArrowRight className="h-3 w-3" /></Button>}
      </div>

      {/* Quick actions */}
      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={markAllDone}>
        <CheckSquare className="mr-0.5 h-3 w-3" /> Done
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={duplicateAll}>
        <Copy className="mr-0.5 h-3 w-3" /> Duplicate
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-[10px] text-red-600 hover:bg-red-50" onClick={deleteAll}>
        <Trash2 className="mr-0.5 h-3 w-3" /> Delete
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px] ml-auto" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
};

export default BulkActions;
