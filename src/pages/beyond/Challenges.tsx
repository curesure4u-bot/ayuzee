import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Rocket,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  category: string;
  xp_reward: number;
  coin_reward: number;
}

interface UserChallenge {
  challenge_id: string;
  status: "in_progress" | "completed" | "failed";
  progress_pct: number;
}

const TYPE_CONFIG = {
  daily: { label: "Daily", icon: Flame, color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  weekly: { label: "Weekly", icon: Calendar, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  monthly: { label: "Monthly", icon: Trophy, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
};

const Challenges = () => {
  const { addXP, addCoins, recordStreak } = useBeyondGamification();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [challRes, userRes] = await Promise.all([
      (supabase as any).from("beyond_challenges").select("id, title, description, type, category, xp_reward, coin_reward").eq("is_active", true).order("type"),
      session.session
        ? (supabase as any).from("beyond_user_challenges").select("challenge_id, status, progress_pct").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setChallenges(challRes.data || []);
    setUserChallenges(userRes.data || []);
    setLoading(false);
  };

  const joinChallenge = async (challengeId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in"); return; }

    await (supabase as any).from("beyond_user_challenges").upsert({
      user_id: session.session.user.id,
      challenge_id: challengeId,
      status: "in_progress",
      progress_pct: 0,
    }, { onConflict: "user_id,challenge_id" });

    setUserChallenges((prev) => [...prev.filter((c) => c.challenge_id !== challengeId), { challenge_id: challengeId, status: "in_progress", progress_pct: 0 }]);
    toast.success("Challenge accepted! Let's go.");
  };

  const completeChallenge = async (challengeId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    await (supabase as any).from("beyond_user_challenges").update({
      status: "completed",
      progress_pct: 100,
      completed_at: new Date().toISOString(),
    }).eq("user_id", session.session.user.id).eq("challenge_id", challengeId);

    setUserChallenges((prev) => prev.map((c) => c.challenge_id === challengeId ? { ...c, status: "completed", progress_pct: 100 } : c));

    await addXP(challenge.xp_reward, "challenge_completed", `Completed: ${challenge.title}`);
    if (challenge.coin_reward > 0) await addCoins(challenge.coin_reward, "challenge_completed");
    await recordStreak("daily_login");

    toast.success(`Challenge done! +${challenge.xp_reward} XP${challenge.coin_reward ? ` +${challenge.coin_reward} coins` : ""} 🎉`);
  };

  const getStatus = (challengeId: string) => userChallenges.find((c) => c.challenge_id === challengeId);

  const completedCount = userChallenges.filter((c) => c.status === "completed").length;
  const activeCount = userChallenges.filter((c) => c.status === "in_progress").length;

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading challenges...</p></div>;
  }

  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");
  const monthlyChallenges = challenges.filter((c) => c.type === "monthly");

  const renderChallengeGroup = (title: string, type: "daily" | "weekly" | "monthly", items: Challenge[]) => {
    const config = TYPE_CONFIG[type];
    const Icon = config.icon;
    if (items.length === 0) return null;

    return (
      <Card key={type}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color}`} /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((challenge) => {
            const status = getStatus(challenge.id);
            const isCompleted = status?.status === "completed";
            const isActive = status?.status === "in_progress";

            return (
              <div key={challenge.id} className={`flex items-center gap-3 rounded-lg border p-3 ${isCompleted ? "bg-green-50 dark:bg-green-950/20 border-green-200" : ""}`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : isActive ? (
                  <Target className="h-5 w-5 text-primary shrink-0 animate-pulse" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>{challenge.title}</p>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px]">+{challenge.xp_reward} XP</Badge>
                    {challenge.coin_reward > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">+{challenge.coin_reward} 🪙</p>
                    )}
                  </div>

                  {!status && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => joinChallenge(challenge.id)}>
                      Join
                    </Button>
                  )}
                  {isActive && (
                    <Button size="sm" className="text-xs" onClick={() => completeChallenge(challenge.id)}>
                      Done ✓
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Flame className="h-7 w-7 text-orange-500" />
            Challenges
          </h1>
          <p className="text-muted-foreground">Daily, weekly, and monthly challenges to keep you growing</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><Rocket className="h-3 w-3" /> {activeCount} active</Badge>
          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> {completedCount} done</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card><CardContent className="p-3 text-center">
          <Flame className="mx-auto h-5 w-5 text-orange-500 mb-1" />
          <p className="text-lg font-bold">{dailyChallenges.length}</p>
          <p className="text-xs text-muted-foreground">Daily</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Calendar className="mx-auto h-5 w-5 text-blue-500 mb-1" />
          <p className="text-lg font-bold">{weeklyChallenges.length}</p>
          <p className="text-xs text-muted-foreground">Weekly</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Trophy className="mx-auto h-5 w-5 text-purple-500 mb-1" />
          <p className="text-lg font-bold">{monthlyChallenges.length}</p>
          <p className="text-xs text-muted-foreground">Monthly</p>
        </CardContent></Card>
      </div>

      {/* Challenge Groups */}
      {renderChallengeGroup("Daily Challenges", "daily", dailyChallenges)}
      {renderChallengeGroup("Weekly Challenges", "weekly", weeklyChallenges)}
      {renderChallengeGroup("Monthly Challenges", "monthly", monthlyChallenges)}

      {challenges.length === 0 && (
        <Card><CardContent className="py-12 text-center">
          <Flame className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No challenges available</p>
          <p className="text-xs text-muted-foreground">Run the SQL seed script to add challenges</p>
        </CardContent></Card>
      )}
    </div>
  );
};

export default Challenges;
