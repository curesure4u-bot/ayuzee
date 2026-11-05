import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Sparkles, Trophy, Award } from "lucide-react";

type Stats = { total_points: number; level_number: number; current_streak: number; longest_streak: number };
type Level = { level_number: number; level_name: string; min_points: number; max_points: number | null; icon: string | null };
type BadgeRow = { id: string; awarded_at: string; gam_badges: { code: string; name: string; icon: string; description: string } | null };

const GamificationDashboard = () => {
  usePageSEO({ title: "Gamification — Ayuzee", noIndex: true });
  const [stats, setStats] = useState<Stats | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [recent, setRecent] = useState<{ id: string; action_type: string; points: number; description: string | null; created_at: string }[]>([]);

  useEffect(() => { (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) return;
      const [s, l, b, t] = await Promise.all([
        (supabase as any).from("gam_user_stats").select("*").eq("user_id", uid).maybeSingle(),
        (supabase as any).from("gam_levels").select("*").order("level_number"),
        (supabase as any).from("gam_user_badges").select("id, awarded_at, gam_badges(code,name,icon,description)").eq("user_id", uid).order("awarded_at", { ascending: false }).limit(6),
        (supabase as any).from("gam_points_transactions").select("id,action_type,points,description,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(8),
      ]);
      setStats(s.data ?? { total_points: 0, level_number: 1, current_streak: 0, longest_streak: 0 });
      setLevels(l.data ?? []);
      setBadges(b.data ?? []);
      setRecent(t.data ?? []);
    })();
  }, []);

  const points = stats?.total_points ?? 0;
  const currentLevel = levels.find((l) => l.level_number === (stats?.level_number ?? 1));
  const nextLevel = levels.find((l) => l.level_number === (stats?.level_number ?? 1) + 1);
  const progressPct = currentLevel
    ? nextLevel
      ? Math.min(100, ((points - currentLevel.min_points) / (nextLevel.min_points - currentLevel.min_points)) * 100)
      : 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Sparkles className="h-3.5 w-3.5"/> Total Points</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{points}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Trophy className="h-3.5 w-3.5"/> Level</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-2xl">{currentLevel?.icon} {currentLevel?.level_name ?? "Beginner"}</p>
            <p className="text-xs text-muted-foreground">Level {stats?.level_number ?? 1}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Flame className="h-3.5 w-3.5"/> Current Streak</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-4xl">{stats?.current_streak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Longest: {stats?.longest_streak ?? 0} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Award className="h-3.5 w-3.5"/> Badges</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{badges.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress to next level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPct} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{currentLevel?.icon} {currentLevel?.level_name}</span>
            <span className="text-muted-foreground">
              {nextLevel ? `${nextLevel.min_points - points} pts to ${nextLevel.icon} ${nextLevel.level_name}` : "Top level reached 🌟"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Badges</CardTitle></CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No badges yet — earn points to unlock your first badge!</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-3 text-center">
                    <div className="text-3xl">{b.gam_badges?.icon}</div>
                    <p className="mt-1 text-xs font-medium">{b.gam_badges?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.description ?? r.action_type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <Badge variant="secondary">+{r.points}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        ℹ️ This points system is for motivation and wellness tracking only. It does not replace medical advice.
      </p>
    </div>
  );
};

export default GamificationDashboard;
