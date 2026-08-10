import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, Play, Pause, CheckCircle, X, Clock, Sparkles } from "lucide-react";
import type { VariableTask } from "./types";

type Props = {
  tasks: VariableTask[];
  onUpdate: (id: string, updates: Partial<VariableTask>) => void;
};

const TaskTrackerFocusMode = ({ tasks, onUpdate }: Props) => {
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [notes, setNotes] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeTasks = tasks.filter(t => !t.is_completed);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const startFocus = () => {
    if (!selectedTaskId) { toast.error("Select a task first"); return; }
    setIsActive(true);
    setElapsed(0);
    toast.success("Focus mode activated. Minimize distractions!");
  };

  const pauseFocus = () => setIsActive(!isActive);

  const endFocus = () => {
    setIsActive(false);
    if (elapsed > 60) {
      toast.success(`Focus session: ${formatTime(elapsed)}`, { description: selectedTask?.task_name });
    }
  };

  const completeTask = () => {
    if (!selectedTaskId) return;
    onUpdate(selectedTaskId, { is_completed: true, progress: 100, status: "Completed", notes: notes || selectedTask?.notes || "" });
    toast.success("Task completed!");
    setIsActive(false);
    setSelectedTaskId("");
    setElapsed(0);
    setNotes("");
  };

  const updateProgress = (progress: number) => {
    if (!selectedTaskId) return;
    onUpdate(selectedTaskId, { progress });
  };

  // Full-screen focus view when active
  if (isActive && selectedTask) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-6">
        {/* Exit button */}
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/50 hover:text-white" onClick={endFocus}>
          <X className="h-6 w-6" />
        </Button>

        {/* Focus indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">FOCUS MODE</span>
        </div>

        {/* Main content */}
        <div className="text-center max-w-lg w-full space-y-8">
          {/* Timer */}
          <div>
            <p className="text-6xl font-mono font-bold text-white tracking-tight">{formatTime(elapsed)}</p>
            <p className="text-white/40 text-sm mt-2">Time invested</p>
          </div>

          {/* Task */}
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-white">{selectedTask.task_name}</p>
            {selectedTask.description && (
              <p className="text-white/60 text-sm">{selectedTask.description}</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-3">
              <Badge className="bg-white/10 text-white/80">{selectedTask.priority}</Badge>
              <Badge className="bg-white/10 text-white/80">{selectedTask.person_in_charge || "Self"}</Badge>
              {selectedTask.due_date && <Badge className="bg-white/10 text-white/80">Due: {selectedTask.due_date}</Badge>}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>Progress</span>
              <span>{selectedTask.progress}%</span>
            </div>
            <Progress value={selectedTask.progress} className="h-2 bg-white/10" />
            <div className="flex gap-2 justify-center mt-2">
              {[25, 50, 75, 100].map(p => (
                <Button key={p} size="sm" variant="ghost" className="text-white/60 hover:text-white h-7 text-xs"
                  onClick={() => updateProgress(p)}>
                  {p}%
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <Textarea
            placeholder="Quick notes while working..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            <Button onClick={pauseFocus} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              {isActive ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {isActive ? "Pause" : "Resume"}
            </Button>
            <Button onClick={completeTask} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-1 h-4 w-4" /> Complete Task
            </Button>
            <Button onClick={endFocus} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              End Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Selection view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6 text-indigo-600" /> Focus Mode
        </h1>
        <p className="text-sm text-muted-foreground">Distraction-free single-task view with time tracking</p>
      </div>

      {/* Select Task */}
      <Card className="border-indigo-200">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <Sparkles className="h-10 w-10 mx-auto text-indigo-400" />
            <h2 className="text-lg font-semibold">Select a task to focus on</h2>
            <p className="text-sm text-muted-foreground">Pick one task and give it your undivided attention</p>
          </div>

          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Choose a task..." /></SelectTrigger>
            <SelectContent>
              {activeTasks.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{t.priority}</Badge>
                    {t.task_name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTask && (
            <Card className="bg-indigo-50/50 border-indigo-100">
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">{selectedTask.task_name}</p>
                {selectedTask.description && <p className="text-xs text-muted-foreground">{selectedTask.description}</p>}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{selectedTask.priority}</Badge>
                  <Badge variant="outline" className="text-[10px]">{selectedTask.status}</Badge>
                  {selectedTask.due_date && <Badge variant="outline" className="text-[10px]"><Clock className="mr-0.5 h-2.5 w-2.5" />{selectedTask.due_date}</Badge>}
                  <Badge variant="outline" className="text-[10px]">{selectedTask.progress}% done</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            onClick={startFocus}
            disabled={!selectedTaskId}
          >
            <Eye className="mr-2 h-5 w-5" /> Enter Focus Mode
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Focus Tips</h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Close all other tabs and notifications</li>
            <li>• Set your phone to Do Not Disturb</li>
            <li>• Work in 25-50 minute focused blocks</li>
            <li>• Use the progress buttons to update as you go</li>
            <li>• Mark complete when you're done — celebrate wins!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerFocusMode;
