import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getBadgesForRole, getCoinRulesForRole, getRewardsForRole,
  getRank, getNextRank, getRarityColor, getRarityBadgeColor,
  type RoleType, type BadgeCategory,
} from "@/data/gamificationConfig";

type AchievementCenterProps = {
  role: RoleType;
  roleName: string;
  roleEmoji: string;
  userPoints: number;
  userCoins: number;
  userStreak: number;
  earnedBadgeIds: string[];
  coinHistory: { date: string; action: string; coins: number; emoji: string; balance: number }[];
  coinsToday: number;
  coinsWeek: number;
  coinsMonth: number;
};

const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🏅" },
  { value: "onboarding", label: "Onboarding", emoji: "🚀" },
  { value: "consistency", label: "Consistency", emoji: "🔥" },
  { value: "quality", label: "Quality", emoji: "⭐" },
  { value: "growth", label: "Growth", emoji: "📈" },
  { value: "milestones", label: "Milestones", emoji: "🏆" },
  { value: "engagement", label: "Engagement", emoji: "💬" },
  { value: "clinical", label: "Clinical", emoji: "🩺" },
  { value: "learning", label: "Learning", emoji: "📖" },
  { value: "skills", label: "Skills", emoji: "🎯" },
  { value: "sales", label: "Sales", emoji: "💰" },
  { value: "teamwork", label: "Teamwork", emoji: "🤝" },
  { value: "attendance", label: "Attendance", emoji: "📅" },
];

export const AchievementCenter = ({ role, roleName, roleEmoji, userPoints, userCoins, userStreak, earnedBadgeIds, coinHistory, coinsToday, coinsWeek, coinsMonth }: AchievementCenterProps) => {
  const [filterCat, setFilterCat] = useState("all");
  const badges = getBadgesForRole(role);
  const coinRules = getCoinRulesForRole(role);
  const rewards = getRewardsForRole(role);
  const currentRank = getRank(userPoints);
  const nextRank = getNextRank(userPoints);
  const earnedCount = earnedBadgeIds.length;
  const completionPct = Math.round((earnedCount / badges.length) * 100);

  const filteredBadges = filterCat === "all" ? badges : badges.filter(b => b.category === filterCat);
  const relevantCategories = CATEGORIES.filter(c => c.value === "all" || badges.some(b => b.category === c.value));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            🏆 Achievement Center
          </h1>
          <p className="text-sm text-muted-foreground">{roleEmoji} {roleName} · Monitor your achievements and badges</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("🎉 Checking for new badges...")}>⭐ Check New Badges</Button>
      </div>

      {/* 🪙 Ayuzee Coins */}
      <Card className="bg-gradient-to-r from-amber-900/90 to-amber-800/90 text-white border-amber-700">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">🪙 Ayuzee Coins</h2>
            <div className="flex items-center gap-1 bg-amber-600/50 px-3 py-1 rounded-full"><span className="text-xl">💰</span><span className="text-xl font-bold">{userCoins}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-700/40 rounded-lg p-3 text-center"><p className="text-xs text-amber-200">Today</p><p className="text-lg font-bold">+{coinsToday} 💰</p></div>
            <div className="bg-amber-700/40 rounded-lg p-3 text-center"><p className="text-xs text-amber-200">This Week</p><p className="text-lg font-bold">+{coinsWeek} 💰</p></div>
            <div className="bg-amber-700/40 rounded-lg p-3 text-center"><p className="text-xs text-amber-200">This Month</p><p className="text-lg font-bold">+{coinsMonth} 💰</p></div>
          </div>
        </CardContent>
      </Card>

      {/* 🎖️ Rank Progress */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentRank?.emoji}</span>
            <div><h3 className="text-xl font-bold">{currentRank?.name}</h3><p className="text-sm text-slate-300">{userPoints} Points</p></div>
            <Badge className="ml-auto bg-slate-700 text-slate-200">{userPoints} pts</Badge>
          </div>
          {nextRank && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress to {nextRank.emoji} {nextRank.name}</span><span>{Math.round(((userPoints - (currentRank?.minPoints || 0)) / (nextRank.minPoints - (currentRank?.minPoints || 0))) * 100)}%</span></div>
              <Progress value={((userPoints - (currentRank?.minPoints || 0)) / (nextRank.minPoints - (currentRank?.minPoints || 0))) * 100} className="h-3 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-400" />
              <p className="text-xs text-slate-400 mt-1">{nextRank.minPoints - userPoints} points to next rank</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📊 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-slate-900 text-white border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-400">{earnedCount}</p><p className="text-xs text-slate-400">Badges Earned</p></CardContent></Card>
        <Card className="bg-slate-900 text-white border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">{userPoints}</p><p className="text-xs text-slate-400">Total Points</p></CardContent></Card>
        <Card className="bg-slate-900 text-white border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-400">{completionPct}%</p><p className="text-xs text-slate-400">Completion</p></CardContent></Card>
        <Card className="bg-slate-900 text-white border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">{badges.length - earnedCount}</p><p className="text-xs text-slate-400">To Unlock</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="badges">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="badges">🏅 Badges</TabsTrigger>
          <TabsTrigger value="earn">💰 Earn</TabsTrigger>
          <TabsTrigger value="rewards">🎁 Rewards</TabsTrigger>
          <TabsTrigger value="history">📜 History</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {relevantCategories.map((cat) => (
              <Button key={cat.value} size="sm" variant={filterCat === cat.value ? "default" : "outline"} onClick={() => setFilterCat(cat.value)} className="text-xs">{cat.emoji} {cat.label}</Button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBadges.map((badge) => {
              const earned = earnedBadgeIds.includes(badge.id);
              return (
                <Card key={badge.id} className={`relative transition hover:shadow-lg hover:-translate-y-0.5 ${earned ? getRarityColor(badge.rarity) : "bg-slate-50 border-slate-200 opacity-60"} ${badge.rarity === "legendary" ? "ring-2 ring-amber-400" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`text-[9px] capitalize ${getRarityBadgeColor(badge.rarity)}`}>{badge.category}</Badge>
                      <Badge className={`text-[9px] capitalize ${getRarityBadgeColor(badge.rarity)}`}>{badge.rarity}</Badge>
                    </div>
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <p className="font-bold text-sm">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
                    <div className="flex items-center gap-1 mt-2"><span className="text-xs">🪙</span><span className="text-xs font-bold">{badge.points}pts</span></div>
                    {earned && <div className="absolute top-2 right-2"><span className="text-green-500 text-lg">✅</span></div>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="earn" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">💰 Ways to Earn Ayuzee Coins</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{coinRules.map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition"><div className="flex items-center gap-2"><span className="text-lg">{rule.emoji}</span><span className="text-sm">{rule.action}</span></div><Badge variant="outline" className="font-bold text-amber-700 bg-amber-50">+{rule.coins} 🪙</Badge></div>
            ))}</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"><CardContent className="p-4 flex items-center gap-4"><div className="text-4xl">🔥</div><div><p className="font-bold text-lg">{userStreak}-Day Streak!</p><p className="text-sm text-muted-foreground">7-day = +25🪙, 30-day = +100🪙. Keep it going!</p></div></CardContent></Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">🎁 Redeem Your Coins</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{rewards.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition"><div className="flex items-center gap-2"><span className="text-xl">{r.emoji}</span><span className="text-sm font-medium">{r.reward}</span></div><Button size="sm" variant="outline" disabled={userCoins < r.coins} onClick={() => toast.success(`🎉 Redeemed: ${r.reward}`)}>{r.coins} 🪙</Button></div>
            ))}</div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">📜 Coin History</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{coinHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border"><div className="flex items-center gap-3"><Badge className="bg-green-100 text-green-700 border-green-300 text-xs">+{entry.coins} 🪙</Badge>{entry.emoji && <span>{entry.emoji}</span>}<div><p className="text-sm font-medium">{entry.action}</p><p className="text-[10px] text-muted-foreground">{entry.date}</p></div></div><span className="text-xs text-muted-foreground">Bal: {entry.balance}</span></div>
            ))}</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"><CardContent className="p-4 text-center"><p className="text-2xl mb-1">🎯</p><p className="font-bold text-emerald-700">Keep Going, Champion!</p><p className="text-xs text-emerald-600 mt-1">Every task completed, every goal achieved brings you closer to new badges!</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
