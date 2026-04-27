import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Calendar, Loader2, Target, Trophy } from "lucide-react";

type Challenge = {
  id: string; title: string; description: string | null;
  audience_role: string; target_action: string; target_count: number;
  points_reward: number; cover_emoji: string | null;
  start_date: string; end_date: string; issues_certificate: boolean;
};
type Participation = {
  challenge_id: string; progress_count: number; completed_at: string | null;
};

const Challenges = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [parts, setParts] = useState<Record<string, Participation>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) return;
    setUid(userId);

    const today = new Date().toISOString().slice(0, 10);
    const [{ data: chs }, { data: ps }] = await Promise.all([
      supabase.from("gam_challenges").select("*").eq("is_active", true).gte("end_date", today).order("end_date"),
      supabase.from("gam_challenge_participants").select("*").eq("user_id", userId),
    ]);
    setChallenges((chs ?? []) as Challenge[]);
    const map: Record<string, Participation> = {};
    (ps ?? []).forEach((p: any) => { map[p.challenge_id] = p; });
    setParts(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const join = async (cid: string) => {
    if (!uid) return;
    setBusy(cid);
    const { error } = await supabase.from("gam_challenge_participants").insert({ challenge_id: cid, user_id: uid });
    if (error) toast({ title: "Could not join", description: error.message, variant: "destructive" });
    else { toast({ title: "Joined challenge!", description: "Your progress will be tracked automatically." }); await load(); }
    setBusy(null);
  };

  const leave = async (cid: string) => {
    if (!uid) return;
    setBusy(cid);
    const { error } = await supabase.from("gam_challenge_participants").delete().eq("challenge_id", cid).eq("user_id", uid);
    if (error) toast({ title: "Could not leave", description: error.message, variant: "destructive" });
    else { toast({ title: "Left challenge" }); await load(); }
    setBusy(null);
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Active Challenges</h2>
        <p className="text-sm text-muted-foreground">Opt-in to a challenge — your progress is tracked automatically as you act.</p>
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Target className="mx-auto h-10 w-10 text-primary/40" />
          <p className="mt-3 text-muted-foreground">No active challenges right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((c) => {
            const p = parts[c.id];
            const progress = p ? Math.min(100, Math.round((p.progress_count / c.target_count) * 100)) : 0;
            const isJoined = !!p;
            const isDone = !!p?.completed_at;
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="flex items-start gap-4 bg-gradient-to-br from-primary/10 to-transparent p-5">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-card text-3xl shadow-soft">{c.cover_emoji || "🎯"}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{c.audience_role}</Badge>
                      {c.issues_certificate && <Badge variant="outline">📜 Certificate</Badge>}
                      <Badge variant="outline">+{c.points_reward} pts</Badge>
                    </div>
                    <h3 className="font-semibold">{c.title}</h3>
                    {c.description && <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                </div>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Ends {new Date(c.end_date).toLocaleDateString("en-IN")}
                  </div>
                  {isJoined && (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium">{p.progress_count} / {c.target_count}</span>
                        <span className="text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    {isDone ? (
                      <Button disabled className="w-full"><Trophy className="h-4 w-4" /> Completed</Button>
                    ) : isJoined ? (
                      <Button variant="outline" className="w-full" onClick={() => leave(c.id)} disabled={busy === c.id}>Leave</Button>
                    ) : (
                      <Button className="w-full" onClick={() => join(c.id)} disabled={busy === c.id}>
                        {busy === c.id ? "Joining…" : "Join Challenge"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Challenges;
