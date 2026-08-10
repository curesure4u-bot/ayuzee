import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, CheckCircle, Clock, Zap } from "lucide-react";
import type { VariableTask } from "./types";

type SessionLog = {
  id: string;
  task_name: string;
  type: "focus" | "break";
  duration: number; // minutes
  completed_at: string;
};

type Props = {
  tasks: VariableTask[];
};

const PRESETS = {
  classic: { focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 },
  short: { focus: 15, shortBreak: 3, longBreak: 10, sessionsBeforeLong: 4 },
  long: { focus: 50, shortBreak: 10, longBreak: 30, sessionsBeforeLong: 2 },
};

const TaskTrackerPomodoro = ({ tasks }: Props) => {
  const [selectedTask, setSelectedTask] = useState("");
  const [preset, setPreset] = useState<"classic" | "short" | "long">("classic");
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timeLeft, setTimeLeft] = useState(PRESETS.classic.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = PRESETS[preset];

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    const taskName = tasks.find(t => t.id === selectedTask)?.task_name || "Unlinked session";

    if (mode === "focus") {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTodaySessions(prev => prev + 1);
      setTotalMinutesToday(prev => prev + config.focus);
      setSessionLog(prev => [{
        id: crypto.randomUUID(),
        task_name: taskName,
        type: "focus",
        duration: config.focus,
        completed_at: new Date().toISOString(),
      }, ...prev]);

      toast.success(`Focus session complete! (${config.focus} min)`, { description: taskName });

      // Switch to break
      if (newCount % config.sessionsBeforeLong === 0) {
        setMode("longBreak");
        setTimeLeft(config.longBreak * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(config.shortBreak * 60);
      }
    } else {
      // Break ended
      toast.info("Break over! Ready for next focus session?");
      setMode("focus");
      setTimeLeft(config.focus * 60);
    }
  }, [mode, sessionCount, selectedTask, config, tasks]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "focus") setTimeLeft(config.focus * 60);
    else if (mode === "shortBreak") setTimeLeft(config.shortBreak * 60);
    else setTimeLeft(config.longBreak * 60);
  };

  const switchMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "focus") setTimeLeft(config.focus * 60);
    else if (newMode === "shortBreak") setTimeLeft(config.shortBreak * 60);
    else setTimeLeft(config.longBreak * 60);
  };

  const changePreset = (p: "classic" | "short" | "long") => {
    setPreset(p);
    setIsRunning(false);
    const c = PRESETS[p];
    if (mode === "focus") setTimeLeft(c.focus * 60);
    else if (mode === "shortBreak") setTimeLeft(c.shortBreak * 60);
    else setTimeLeft(c.longBreak * 60);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Progress percentage
  const totalSeconds = mode === "focus" ? config.focus * 60 : mode === "shortBreak" ? config.shortBreak * 60 : config.longBreak * 60;
  const progressPct = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Colors based on mode
  const modeColors = {
    focus: { bg: "from-red-500 to-rose-600", ring: "ring-red-400", text: "text-red-700" },
    shortBreak: { bg: "from-green-500 to-emerald-600", ring: "ring-green-400", text: "text-green-700" },
    longBreak: { bg: "from-blue-500 to-indigo-600", ring: "ring-blue-400", text: "text-blue-700" },
  };
  const colors = modeColors[mode];

  const activeTasks = tasks.filter(t => !t.is_completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Timer className="h-6 w-6 text-red-500" /> Pomodoro Timer
          </h1>
          <p className="text-sm text-muted-foreground">Focus sessions to boost productivity</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline"><Zap className="mr-1 h-3 w-3" />{todaySessions} sessions today</Badge>
          <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{totalMinutesToday} min focused</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Timer Section */}
        <div className="space-y-6">
          {/* Mode Tabs */}
          <div className="flex gap-2 justify-center">
            <Button variant={mode === "focus" ? "default" : "outline"} size="sm" onClick={() => switchMode("focus")} className={mode === "focus" ? "bg-red-600" : ""}>
              <Brain className="mr-1 h-3.5 w-3.5" /> Focus
            </Button>
            <Button variant={mode === "shortBreak" ? "default" : "outline"} size="sm" onClick={() => switchMode("shortBreak")} className={mode === "shortBreak" ? "bg-green-600" : ""}>
              <Coffee className="mr-1 h-3.5 w-3.5" /> Short Break
            </Button>
            <Button variant={mode === "longBreak" ? "default" : "outline"} size="sm" onClick={() => switchMode("longBreak")} className={mode === "longBreak" ? "bg-blue-600" : ""}>
              <Coffee className="mr-1 h-3.5 w-3.5" /> Long Break
            </Button>
          </div>

          {/* Timer Display */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${colors.bg} p-12 text-center relative`}>
                {/* Progress ring background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-56 w-56 -rotate-90 opacity-20">
                    <circle cx="112" cy="112" r="100" fill="none" stroke="white" strokeWidth="8" />
                    <circle cx="112" cy="112" r="100" fill="none" stroke="white" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (1 - progressPct / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                </div>

                <div className="relative z-10">
                  <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">
                    {mode === "focus" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
                  </p>
                  <p className="text-7xl font-bold text-white font-mono tracking-tight">{formatTime(timeLeft)}</p>
                  <p className="text-white/60 text-xs mt-2">Session {sessionCount + 1} · {preset} preset</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 p-6 bg-card">
                <Button size="lg" onClick={toggleTimer} className={`h-14 w-14 rounded-full ${isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}`}>
                  {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer} className="h-14 w-14 rounded-full">
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Selection */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Link to Task</Label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a task..." /></SelectTrigger>
                    <SelectContent>
                      {activeTasks.slice(0, 15).map(t => <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Timer Preset</Label>
                  <Select value={preset} onValueChange={v => changePreset(v as any)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic (25/5)</SelectItem>
                      <SelectItem value="short">Short (15/3)</SelectItem>
                      <SelectItem value="long">Deep Work (50/10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Focus: {config.focus}min · Short break: {config.shortBreak}min · Long break after {config.sessionsBeforeLong} sessions: {config.longBreak}min
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionLog.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No sessions yet. Start your first focus!</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sessionLog.map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0">
                      <div className={`h-6 w-6 rounded-full grid place-items-center ${s.type === "focus" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {s.type === "focus" ? <Brain className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.task_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s.duration}min · {new Date(s.completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge variant={s.type === "focus" ? "destructive" : "secondary"} className="text-[9px]">
                        {s.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
            <CardContent className="p-4 text-center space-y-2">
              <Timer className="h-8 w-8 mx-auto text-red-500" />
              <p className="text-2xl font-bold text-red-700">{todaySessions}</p>
              <p className="text-xs text-red-600">Focus Sessions</p>
              <p className="text-lg font-bold text-red-700">{totalMinutesToday} min</p>
              <p className="text-xs text-red-600">Total Focus Time</p>
              <div className="pt-2 border-t border-red-100">
                <p className="text-[10px] text-muted-foreground">
                  {todaySessions >= 8 ? "🏆 Outstanding focus today!" :
                   todaySessions >= 4 ? "🔥 Great productivity!" :
                   todaySessions >= 1 ? "👍 Good start, keep going!" :
                   "Start your first session!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskTrackerPomodoro;
