import { useState, useEffect } from "react";
import {
  Award,
  Crown,
  Medal,
  Star,
  Trophy,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  xp_this_week: number;
  rank: number | null;
  specialty: string | null;
  institution: string | null;
}

interface UserXP {
  total_xp: number;
  current_level: number;
  level_title: string;
}

const PODIUM_COLORS = [
  "from-amber-400 to-yellow-500", // 1st
  "from-slate-300 to-slate-400",  // 2nd
  "from-amber-600 to-orange-700", // 3rd
];

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myXP, setMyXP] = useState<UserXP | null>(null);
  const [myWeeklyXP, setMyWeeklyXP] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    setCurrentUserId(userId || null);

    // Get current week start (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff)).toISOString().split("T")[0];

    // Fetch leaderboard
    const { data: leaderData } = await (supabase as any)
      .from("beyond_leaderboard_weekly")
      .select("user_id, xp_this_week, rank, specialty, institution")
      .eq("week_start", weekStart)
      .order("xp_this_week", { ascending: false })
      .limit(20);

    const ranked = (leaderData || []).map((entry: LeaderboardEntry, idx: number) => ({
      ...entry,
      rank: idx + 1,
    }));
    setEntries(ranked);

    // My position
    if (userId) {
      const myEntry = ranked.find((e: LeaderboardEntry) => e.user_id === userId);
      setMyWeeklyXP(myEntry?.xp_this_week || 0);
      setMyRank(myEntry?.rank || null);

      const { data: xpData } = await (supabase as any)
        .from("beyond_user_xp")
        .select("total_xp, current_level, level_title")
        .eq("user_id", userId)
        .maybeSingle();
      setMyXP(xpData || null);
    }

    setLoading(false);
  };

  const getInitials = (userId: string) => userId.slice(0, 2).toUpperCase();

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading leaderboard...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">Weekly XP rankings — compete with yourself and others</p>
        </div>
        <Badge variant="outline" className="w-fit text-xs">Resets every Monday</Badge>
      </div>

      {/* My Stats */}
      {myXP && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">You</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Your Stats</p>
                  <p className="text-xs text-muted-foreground">Lv.{myXP.current_level} {myXP.level_title} · {myXP.total_xp} total XP</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{myWeeklyXP} XP</p>
                <p className="text-xs text-muted-foreground">
                  {myRank ? `#${myRank} this week` : "Not ranked yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podium (Top 3) */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd place */}
          <div className="text-center">
            <Avatar className="mx-auto h-12 w-12 border-2 border-slate-400">
              <AvatarFallback className={`bg-gradient-to-br ${PODIUM_COLORS[1]} text-white`}>
                {getInitials(entries[1].user_id)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-1 rounded-t-lg bg-slate-200 dark:bg-slate-700 px-6 py-4">
              <Medal className="mx-auto h-4 w-4 text-slate-500" />
              <p className="text-xs font-bold mt-1">{entries[1].xp_this_week} XP</p>
              <p className="text-[10px] text-muted-foreground">#2</p>
            </div>
          </div>
          {/* 1st place */}
          <div className="text-center">
            <Avatar className="mx-auto h-14 w-14 border-2 border-amber-400">
              <AvatarFallback className={`bg-gradient-to-br ${PODIUM_COLORS[0]} text-white`}>
                {getInitials(entries[0].user_id)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-1 rounded-t-lg bg-amber-100 dark:bg-amber-900/40 px-8 py-6">
              <Crown className="mx-auto h-5 w-5 text-amber-500" />
              <p className="text-sm font-bold mt-1">{entries[0].xp_this_week} XP</p>
              <p className="text-[10px] text-muted-foreground">#1</p>
            </div>
          </div>
          {/* 3rd place */}
          <div className="text-center">
            <Avatar className="mx-auto h-12 w-12 border-2 border-orange-400">
              <AvatarFallback className={`bg-gradient-to-br ${PODIUM_COLORS[2]} text-white`}>
                {getInitials(entries[2].user_id)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-1 rounded-t-lg bg-orange-100 dark:bg-orange-900/40 px-6 py-3">
              <Star className="mx-auto h-4 w-4 text-orange-500" />
              <p className="text-xs font-bold mt-1">{entries[2].xp_this_week} XP</p>
              <p className="text-[10px] text-muted-foreground">#3</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" /> This Week's Rankings
          </CardTitle>
          <CardDescription className="text-xs">Top earners reset every Monday</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No activity this week yet</p>
              <p className="text-xs text-muted-foreground">Complete tools and lessons to appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => {
                const isMe = entry.user_id === currentUserId;
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                      isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {entry.rank === 1 ? <Crown className="mx-auto h-4 w-4 text-amber-500" /> :
                       entry.rank === 2 ? <Medal className="mx-auto h-4 w-4 text-slate-400" /> :
                       entry.rank === 3 ? <Star className="mx-auto h-4 w-4 text-orange-500" /> :
                       <span className="text-sm font-medium text-muted-foreground">#{entry.rank}</span>}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {isMe ? "You" : getInitials(entry.user_id)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {isMe ? "You" : `User ${entry.user_id.slice(0, 6)}`}
                        {isMe && <Badge variant="secondary" className="ml-2 text-[9px]">You</Badge>}
                      </p>
                      {entry.specialty && (
                        <p className="text-[10px] text-muted-foreground">{entry.specialty}</p>
                      )}
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-violet-500" />
                      <span className="text-sm font-bold">{entry.xp_this_week}</span>
                      <span className="text-xs text-muted-foreground">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivation */}
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            The leaderboard is opt-in and focuses on <strong>growth, not comparison</strong>.
            Your real competition is yesterday's version of yourself.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
