import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Filter,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "bg-green-500", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  medium: { label: "Medium", color: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  hard: { label: "Hard", color: "bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

interface Challenge101 {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "in_progress" | "completed";
}

const My101Challenges = () => {
  const { addXP, addCoins } = useBeyondGamification();
  const [challenges, setChallenges] = useState<Challenge101[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const { data } = await (supabase as any).from("beyond_101_challenges")
      .select("id, title, difficulty, status")
      .eq("user_id", session.session.user.id)
      .order("sort_order")
      .order("created_at");
    setChallenges(data || []);
    setLoading(false);
  };

  const addChallenge = async () => {
    if (!newTitle.trim()) { toast.error("Describe your challenge"); return; }
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_101_challenges").insert({
      user_id: session.session.user.id,
      title: newTitle.trim(),
      difficulty: newDifficulty,
      sort_order: challenges.length,
    }).select().single();
    if (data) setChallenges((prev) => [...prev, data]);
    setNewTitle("");
    toast.success("Challenge added!");
  };

  const completeChallenge = async (id: string) => {
    await (supabase as any).from("beyond_101_challenges").update({
      status: "completed", completed_at: new Date().toISOString(),
    }).eq("id", id);
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, status: "completed" } : c));

    const challenge = challenges.find((c) => c.id === id);
    const xp = challenge?.difficulty === "hard" ? 100 : challenge?.difficulty === "medium" ? 50 : 25;
    await addXP(xp, "101_challenge_done", `Completed: ${challenge?.title}`);
    await addCoins(Math.round(xp / 2), "101_challenge_done");
    toast.success(`Challenge conquered! +${xp} XP 🎉`);
  };

  const deleteChallenge = async (id: string) => {
    await (supabase as any).from("beyond_101_challenges").delete().eq("id", id);
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = filter === "all" ? challenges :
    filter === "completed" ? challenges.filter((c) => c.status === "completed") :
    challenges.filter((c) => c.difficulty === filter);

  const completedCount = challenges.filter((c) => c.status === "completed").length;
  const easyCount = challenges.filter((c) => c.difficulty === "easy").length;
  const mediumCount = challenges.filter((c) => c.difficulty === "medium").length;
  const hardCount = challenges.filter((c) => c.difficulty === "hard").length;

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-orange-500" />
            101 Challenges
          </h1>
          <p className="text-muted-foreground">Track & prioritize your challenges. Tackle them one by one.</p>
        </div>
        <Badge variant="secondary" className="gap-1"><Trophy className="h-3 w-3" /> {completedCount}/{challenges.length} conquered</Badge>
      </div>

      {/* Progress */}
      {challenges.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{completedCount} of {challenges.length} challenges completed</span>
              <span className="text-sm font-bold">{challenges.length > 0 ? Math.round((completedCount / challenges.length) * 100) : 0}%</span>
            </div>
            <Progress value={challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Add Challenge */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input placeholder="Describe your challenge..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChallenge()} />
            </div>
            <Select value={newDifficulty} onValueChange={(v: "easy" | "medium" | "hard") => setNewDifficulty(v)}>
              <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🟢 Easy</SelectItem>
                <SelectItem value="medium">🟠 Medium</SelectItem>
                <SelectItem value="hard">🔴 Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addChallenge} className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} className="text-xs gap-1" onClick={() => setFilter("all")}>
          <Filter className="h-3 w-3" /> All ({challenges.length})
        </Button>
        <Button size="sm" variant={filter === "easy" ? "default" : "outline"} className="text-xs gap-1" onClick={() => setFilter("easy")}>
          🟢 Easy ({easyCount})
        </Button>
        <Button size="sm" variant={filter === "medium" ? "default" : "outline"} className="text-xs gap-1" onClick={() => setFilter("medium")}>
          🟠 Medium ({mediumCount})
        </Button>
        <Button size="sm" variant={filter === "hard" ? "default" : "outline"} className="text-xs gap-1" onClick={() => setFilter("hard")}>
          🔴 Hard ({hardCount})
        </Button>
        <Button size="sm" variant={filter === "completed" ? "default" : "outline"} className="text-xs gap-1" onClick={() => setFilter("completed")}>
          ✅ Completed ({completedCount})
        </Button>
      </div>

      {/* Challenges List */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center">
          <Target className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No challenges added yet. Start by adding one above!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((challenge) => {
            const config = DIFFICULTY_CONFIG[challenge.difficulty];
            const isDone = challenge.status === "completed";
            return (
              <div key={challenge.id} className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${isDone ? "bg-green-50 dark:bg-green-950/20 border-green-200" : ""}`}>
                <button onClick={() => !isDone && completeChallenge(challenge.id)}>
                  {isDone ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isDone ? "line-through text-muted-foreground" : "font-medium"}`}>{challenge.title}</p>
                </div>
                <Badge className={`text-[10px] ${config.badge}`}>{config.label}</Badge>
                {!isDone && (
                  <button onClick={() => deleteChallenge(challenge.id)} className="text-muted-foreground hover:text-destructive text-xs">✕</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default My101Challenges;
