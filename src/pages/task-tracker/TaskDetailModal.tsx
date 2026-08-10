import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Calendar, User, Flag, Clock, MessageSquare, ListChecks,
  Activity, Paperclip, Send, CheckCircle,
} from "lucide-react";
import SubtasksList, { type Subtask } from "./SubtasksList";
import type { VariableTask } from "./types";
import { getDaysLeft, getPriorityColor, getDecisionColor } from "./types";

type ActivityItem = {
  id: string;
  type: "created" | "status_change" | "comment" | "progress" | "completed" | "subtask";
  message: string;
  user: string;
  timestamp: string;
};

type Props = {
  task: VariableTask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<VariableTask>) => void;
};

const TaskDetailModal = ({ task, open, onClose, onUpdate }: Props) => {
  const [comment, setComment] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: "1", title: "Research best approach", is_done: true },
    { id: "2", title: "Draft initial version", is_done: true },
    { id: "3", title: "Get feedback from team", is_done: false },
    { id: "4", title: "Finalize and submit", is_done: false },
  ]);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([
    { id: "a1", type: "created", message: "Task created", user: "System", timestamp: task?.created_at || new Date().toISOString() },
    { id: "a2", type: "status_change", message: "Status changed to 'In progress'", user: "You", timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: "a3", type: "progress", message: "Progress updated to 50%", user: "You", timestamp: new Date(Date.now() - 43200000).toISOString() },
  ]);

  if (!task) return null;

  const daysLeft = getDaysLeft(task.due_date);

  const addComment = () => {
    if (!comment.trim()) return;
    setActivityLog(prev => [{
      id: crypto.randomUUID(),
      type: "comment",
      message: comment,
      user: "You",
      timestamp: new Date().toISOString(),
    }, ...prev]);
    setComment("");
    toast.success("Comment added");
  };

  const handleSubtasksChange = (newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks);
    // Update progress based on subtask completion
    const done = newSubtasks.filter(s => s.is_done).length;
    const total = newSubtasks.length;
    if (total > 0) {
      const newProgress = Math.round((done / total) * 100);
      onUpdate(task.id, { progress: newProgress });
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created": return <Activity className="h-3 w-3 text-blue-500" />;
      case "status_change": return <Flag className="h-3 w-3 text-amber-500" />;
      case "comment": return <MessageSquare className="h-3 w-3 text-purple-500" />;
      case "progress": return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "completed": return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "subtask": return <ListChecks className="h-3 w-3 text-teal-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className={`h-3 w-3 rounded-full ${task.is_completed ? "bg-green-500" : "bg-teal-500"}`} />
            {task.task_name}
          </DialogTitle>
        </DialogHeader>

        {/* Task Meta */}
        <div className="flex flex-wrap gap-2 pb-3 border-b">
          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
          <Badge variant="outline">{task.status}</Badge>
          <Badge className={getDecisionColor(task.decision)}>{task.decision}</Badge>
          {task.person_in_charge && (
            <Badge variant="secondary"><User className="mr-1 h-2.5 w-2.5" />{task.person_in_charge}</Badge>
          )}
          {task.due_date && (
            <Badge variant="outline" className={daysLeft !== null && daysLeft < 0 ? "text-red-600 border-red-200" : ""}>
              <Calendar className="mr-1 h-2.5 w-2.5" />
              Due: {task.due_date}
              {daysLeft !== null && <span className="ml-1">({daysLeft}d)</span>}
            </Badge>
          )}
          <Badge variant="outline"><Clock className="mr-1 h-2.5 w-2.5" />{task.kanban_category}</Badge>
        </div>

        {/* Description */}
        {task.description && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3 py-2">
          <span className="text-xs text-muted-foreground">Progress:</span>
          <Progress value={task.progress} className="h-2 flex-1" />
          <span className="text-xs font-bold">{task.progress}%</span>
        </div>

        {/* Tabs: Subtasks / Activity / Comments */}
        <Tabs defaultValue="subtasks" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subtasks" className="text-xs">
              <ListChecks className="mr-1 h-3.5 w-3.5" /> Subtasks ({subtasks.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="mr-1 h-3.5 w-3.5" /> Activity ({activityLog.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <Paperclip className="mr-1 h-3.5 w-3.5" /> Notes
            </TabsTrigger>
          </TabsList>

          {/* Subtasks Tab */}
          <TabsContent value="subtasks" className="mt-3">
            <SubtasksList subtasks={subtasks} onChange={handleSubtasksChange} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-3 space-y-3">
            {/* Comment input */}
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addComment()}
                placeholder="Add a comment..."
                className="text-xs"
              />
              <Button size="icon" className="h-8 w-8 shrink-0 bg-teal-600 hover:bg-teal-700" onClick={addComment}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Activity timeline */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {activityLog.map(item => (
                <div key={item.id} className="flex items-start gap-2 text-xs py-1.5 border-b last:border-0">
                  <div className="mt-0.5 shrink-0">{getActivityIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    {item.type === "comment" ? (
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="font-medium text-[10px] text-muted-foreground">{item.user}</p>
                        <p className="mt-0.5">{item.message}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">{item.user}</span> {item.message}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground shrink-0">
                    {new Date(item.timestamp).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-3 space-y-3">
            <Textarea
              defaultValue={task.notes}
              onChange={e => onUpdate(task.id, { notes: e.target.value })}
              placeholder="Add notes, links, or references..."
              rows={6}
              className="text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Notes are auto-saved as you type.</p>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-3 border-t">
          {!task.is_completed && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => { onUpdate(task.id, { is_completed: true }); toast.success("Task completed!"); onClose(); }}
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Mark Complete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
