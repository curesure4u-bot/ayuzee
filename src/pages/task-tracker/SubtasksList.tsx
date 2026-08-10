import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, X, GripVertical } from "lucide-react";

export type Subtask = {
  id: string;
  title: string;
  is_done: boolean;
};

type Props = {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  readonly?: boolean;
};

/**
 * Inline subtask checklist component.
 * Used inside task detail modals or inline within task cards.
 */
const SubtasksList = ({ subtasks, onChange, readonly = false }: Props) => {
  const [newTitle, setNewTitle] = useState("");

  const doneCount = subtasks.filter(s => s.is_done).length;
  const totalCount = subtasks.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const addSubtask = () => {
    if (!newTitle.trim()) return;
    onChange([...subtasks, { id: crypto.randomUUID(), title: newTitle.trim(), is_done: false }]);
    setNewTitle("");
  };

  const toggleSubtask = (id: string) => {
    onChange(subtasks.map(s => s.id === id ? { ...s, is_done: !s.is_done } : s));
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter(s => s.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    onChange(subtasks.map(s => s.id === id ? { ...s, title } : s));
  };

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground font-medium">{doneCount}/{totalCount}</span>
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-2 group rounded px-1 py-0.5 hover:bg-muted/50">
            <GripVertical className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
            <Checkbox
              checked={subtask.is_done}
              onCheckedChange={() => !readonly && toggleSubtask(subtask.id)}
              disabled={readonly}
              className="shrink-0"
            />
            {readonly ? (
              <span className={`text-xs flex-1 ${subtask.is_done ? "line-through text-muted-foreground" : ""}`}>
                {subtask.title}
              </span>
            ) : (
              <Input
                value={subtask.title}
                onChange={e => updateTitle(subtask.id, e.target.value)}
                className={`h-6 border-0 bg-transparent px-0 text-xs focus-visible:ring-0 ${subtask.is_done ? "line-through text-muted-foreground" : ""}`}
              />
            )}
            {!readonly && (
              <button
                onClick={() => removeSubtask(subtask.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      {!readonly && (
        <div className="flex gap-1">
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSubtask()}
            placeholder="Add a subtask..."
            className="h-7 text-xs"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={addSubtask}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubtasksList;
