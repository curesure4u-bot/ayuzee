import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Star, Zap, Target, Medal, Crown, Shield, Award } from "lucide-react";
import type { VariableTask } from "./types";

type Props = {
  tasks: VariableTask[];
};

type BadgeDef = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  condition: (stats: Stats) => boolean;
};

type Stats = {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  highPriorityDone: number;
  onTimePct: number;
  totalTasks: number;
  level: number;
  xp: number;
};

const BADGES: BadgeDef[] = [
  { id: "first-task", name: "First Step", description: "Complete your first task", icon: Star, color: "bg-blue-100 text-blue-600", condition: s => s.totalCompleted >= 1 },
  { id: "ten-tasks", name: "Getting Started", description: "Complete 10 tasks", icon: Zap, color: "bg-green-100 text-green-600", condition: s => s.totalCompleted >= 10 },
  { id: "fifty-tasks", name: "Task Master", description: "Complete 50 tasks", icon: Trophy, color: "bg-amber-100 text-amber-600", condition: s => s.totalCompleted >= 50 },
  { id: "hundred-tasks", name: "Century Club", description: "Complete 100 tasks", icon: Crown, color: "bg-purple-100 text-purple-600", condition: s => s.totalCompleted >= 100 },
  { id: "streak-3", name: "Hat Trick", description: "3-day completion streak", icon: Flame, color: "bg-orange-100 text-orange-600", condition: s => s.longestStreak >= 3 },
  { id: "streak-7", name: "Week Warrior", description: "7-day completion streak", icon: Flame, color: "bg-red-100 text-red-600", condition: s => s.longestStreak >= 7 },
  { id: "streak-30", name: "Monthly Maestro", description: "30-day completion streak", icon: Flame, color: "bg-rose-100 text-rose-600", condition: s => s.longestStreak >= 30 },
  { id: "high-pri-5", name: "Priority Pro", description: "Complete 5 high-priority tasks", icon: Target, color: "bg-red-100 text-red-700", condition: s => s.highPriorityDone >= 5 },
  { id: "on-time-90", name: "Time Keeper", description: "90%+ on-time completion rate", icon: Shield, color: "bg-teal-100 text-teal-600", condition: s => s.onTimePct >= 90 },
  { id: "level-5", name: "Level 5", description: "Reach Level 5", icon: Medal, color: "bg-indigo-100 text-indigo-600", condition: s => s.level >= 5 },
  { id: "level-10", name: "Expert", description: "Reach Level 10", icon: Award, color: "bg-amber-100 text-amber-700", condition: s => s.level >= 10 },
];

const TaskTrackerStreaks = ({ tasks }: Props) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const stats: Stats = useMemo(() => {
    const completed = tasks.filter(t => t.is_completed);
    const totalCompleted = completed.length;
    const highPriorityDone = completed.filter(t => t.priority === "Very High" || t.priority === "High").length;

    // On-time percentage (completed before or on due date)
    const withDueDate = completed.filter(t => t.due_date && t.completed_at);
    const onTime = withDueDate.filter(t => t.completed_at!.split("T")[0] <= t.due_date!).length;
    const onTimePct = withDueDate.length > 0 ? Math.round((onTime / withDueDate.length) * 100) : 100;

    // Calculate streak (consecutive days with at least 1 completion)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const d = new Date(today);

    for (let i = 0; i < 90; i++) {
      const dateStr = d.toISOString().split("T")[0];
      const completedOnDay = completed.filter(t => t.completed_at && t.completed_at.startsWith(dateStr)).length;

      if (completedOnDay > 0) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
      d.setDate(d.getDate() - 1);
    }

    // XP and Level
    const xp = totalCompleted * 10 + highPriorityDone * 5 + currentStreak * 3;
    const level = Math.floor(xp / 100) + 1;

    return { totalCompleted, currentStreak, longestStreak, highPriorityDone, onTimePct, totalTasks: tasks.length, level, xp };
  }, [tasks, todayStr]);

  const earnedBadges = BADGES.filter(b => b.condition(stats));
  const lockedBadges = BADGES.filter(b => !b.condition(stats));
  const xpToNextLevel = 100 - (stats.xp % 100);
  const xpProgress = ((stats.xp % 100) / 100) * 100;

  // 30-day heatmap
  const heatmap = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = tasks.filter(t => t.completed_at && t.completed_at.startsWith(dateStr)).length;
      days.push({ date: dateStr, count });
    }
    return days;
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Productivity Streaks
          </h1>
          <p className="text-sm text-muted-foreground">Gamification — earn badges, level up, and track streaks</p>
        </div>
      </div>

      {/* Level & XP */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.level}</p>
                <p className="text-[9px] uppercase">Level</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Level {stats.level}</span>
                <span className="text-muted-foreground">{stats.xp} XP total</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">{xpToNextLevel} XP to Level {stats.level + 1}</p>
              <p className="text-[10px] text-muted-foreground">
                XP earned from: tasks completed (×10) + high priority (×5) + streak days (×3)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
            <p className="text-[10px] text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-amber-600">{stats.longestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Tasks Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-teal-500 mb-1" />
            <p className="text-2xl font-bold text-teal-600">{stats.onTimePct}%</p>
            <p className="text-[10px] text-muted-foreground">On-Time Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">30-Day Completion Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-[3px] flex-wrap">
            {heatmap.map(day => (
              <div
                key={day.date}
                className={`h-5 w-5 rounded-sm border ${
                  day.count >= 3 ? "bg-green-600 border-green-700" :
                  day.count === 2 ? "bg-green-400 border-green-500" :
                  day.count === 1 ? "bg-green-200 border-green-300" :
                  "bg-gray-100 border-gray-200"
                }`}
                title={`${day.date}: ${day.count} task${day.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-100 border border-gray-200" /> 0</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-200" /> 1</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-400" /> 2</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-600" /> 3+</span>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earned */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center gap-2">
              <Award className="h-4 w-4" /> Earned Badges ({earnedBadges.length}/{BADGES.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map(badge => (
                <div key={badge.id} className={`flex items-center gap-2 rounded-lg border p-2 ${badge.color}`}>
                  <badge.icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold">{badge.name}</p>
                    <p className="text-[9px] opacity-80">{badge.description}</p>
                  </div>
                </div>
              ))}
              {earnedBadges.length === 0 && (
                <p className="col-span-2 text-xs text-muted-foreground py-4 text-center">Complete tasks to earn badges!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Locked */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              🔒 Locked Badges ({lockedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {lockedBadges.map(badge => (
                <div key={badge.id} className="flex items-center gap-2 rounded-lg border border-dashed p-2 opacity-50">
                  <badge.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">{badge.name}</p>
                    <p className="text-[9px] text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskTrackerStreaks;
