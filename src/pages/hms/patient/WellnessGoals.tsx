import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Flame, Trophy, Calendar, Plus, Brain, Leaf } from "lucide-react";
import { toast } from "sonner";

const activeGoals = [
  { id: 1, name: "Lose 5kg", target: "5kg", current: 2, max: 5, percent: 40, streak: 8, start: "2024-11-01", deadline: "2025-03-01" },
  { id: 2, name: "Do yoga daily", target: "Daily", current: 12, max: 30, percent: 40, streak: 12, start: "2024-12-15", deadline: "2025-01-15" },
  { id: 3, name: "Reduce sugar (HbA1c)", target: "HbA1c < 7", current: 7.8, max: 11, percent: 55, streak: 20, start: "2024-10-01", deadline: "2025-04-01" },
  { id: 4, name: "Follow Pathya 90%", target: "90%", current: 82, max: 100, percent: 82, streak: 5, start: "2024-12-20", deadline: "2025-01-20" },
  { id: 5, name: "Sleep by 10 PM", target: "7/7 days", current: 5, max: 7, percent: 71, streak: 5, start: "2024-12-22", deadline: "Ongoing" },
  { id: 6, name: "Walk 5000 steps", target: "5000 steps/day", current: 4200, max: 5000, percent: 84, streak: 3, start: "2024-12-10", deadline: "Ongoing" },
];

const streakLeaderboard = [
  { rank: 1, name: "Mrs. Lakshmi", streak: 45, badge: "Champion" },
  { rank: 2, name: "Mr. Rajesh", streak: 30, badge: "Warrior" },
  { rank: 3, name: "Ms. Priya", streak: 28, badge: "Consistent" },
  { rank: 4, name: "Mr. Suresh", streak: 21, badge: "Rising" },
  { rank: 5, name: "Mrs. Anita", streak: 14, badge: "Starter" },
];

const badges = [
  { label: "7-day warrior", emoji: "🔥" },
  { label: "Perfect Pathya week", emoji: "🌿" },
  { label: "Yoga master", emoji: "🧘" },
  { label: "Early bird", emoji: "🌅" },
  { label: "Hydration hero", emoji: "💧" },
  { label: "30-day champion", emoji: "👑" },
];

const calendarDays = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  met: Math.random() > 0.3,
}));

const WellnessGoals = () => {
  const [showForm, setShowForm] = useState(false);
  const [goalType, setGoalType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleAddGoal = () => {
    if (!goalType || !targetValue) {
      toast.error("Please fill goal type and target");
      return;
    }
    toast.success(`Goal "${goalType}" added successfully`);
    setShowForm(false);
    setGoalType("");
    setTargetValue("");
    setDeadline("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" /> Wellness Goals & Streaks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track patient goals tied to Prakriti improvement, Agni strengthening & Dosha balance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add New Goal
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium mb-1 block">Goal Type</label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger><SelectValue placeholder="Select goal type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Yoga Practice">Yoga Practice</SelectItem>
                  <SelectItem value="Sugar Control">Sugar Control (HbA1c)</SelectItem>
                  <SelectItem value="Pathya Compliance">Pathya Compliance</SelectItem>
                  <SelectItem value="Sleep Schedule">Sleep Schedule</SelectItem>
                  <SelectItem value="Walking Steps">Walking Steps</SelectItem>
                  <SelectItem value="Dosha Balance">Dosha Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-medium mb-1 block">Target Value</label>
              <Input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g. 5kg, 7 days" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-medium mb-1 block">Deadline</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <Button onClick={handleAddGoal}>Save Goal</Button>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeGoals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{goal.name}</span>
                <Badge variant="outline" className="text-xs">
                  <Flame className="h-3 w-3 mr-1 text-orange-500" /> {goal.streak} days
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">Target: {goal.target}</div>
              <Progress value={goal.percent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.percent}% complete</span>
                <span>Deadline: {goal.deadline}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Started: {goal.start}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Suggestion */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">AI Suggestion (Based on Prakriti & Vikruti)</p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your Prakriti and current Vikruti, we suggest focusing on: <strong>Pitta-cooling foods and evening walks</strong>. 
              Prioritize Agni strengthening with warm water mornings and Triphala before bed.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Streak Leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Streak Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {streakLeaderboard.map((p) => (
                <div key={p.rank} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-muted-foreground">#{p.rank}</span>
                    <span>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{p.badge}</Badge>
                    <span className="font-semibold text-xs">{p.streak} days 🔥</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges Earned */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" /> Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b) => (
                <div key={b.label} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <span className="text-xl">{b.emoji}</span>
                  <span className="text-xs font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Achievement Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Monthly Achievement Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-7 gap-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground pb-1">{d}</div>
            ))}
            {calendarDays.map((d) => (
              <div
                key={d.day}
                className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                  d.met ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" /> Goals met</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" /> Missed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessGoals;
