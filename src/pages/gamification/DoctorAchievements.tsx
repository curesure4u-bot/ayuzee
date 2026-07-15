import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getBadgesForRole, getCoinRulesForRole, getRank, getNextRank,
  getRarityColor, getRarityBadgeColor, RANKS,
  type BadgeCategory,
} from "@/data/gamificationConfig";

const doctorBadges = getBadgesForRole("doctor");
const doctorCoinRules = getCoinRulesForRole("doctor");

// Simulated user state
const userPoints = 1850;
const userCoins = 245;
const userStreak = 12;
const earnedBadgeIds = ["dr-first-steps", "dr-first-rx", "dr-week-warrior", "dr-ai-adopter", "dr-teleconsult-pro"];
const currentRank = getRank(userPoints);
const nextRank = getNextRank(userPoints);

const coinHistory = [
  { date: "Jul 15, 2026 · 09:35", action: "Complete consultation", coins: 5, badge: "", balance: 245 },
  { date: "Jul 15, 2026 · 09:32", action: "Use AI Scribe", coins: 3, badge: "", balance: 240 },
  { date: "Jul 15, 2026 · 08:00", action: "Daily login", coins: 2, badge: "", balance: 237 },
  { date: "Jul 14, 2026 · 17:00", action: "Patient gives 5-star", coins: 10, badge: "⭐", balance: 235 },
  { date: "Jul 14, 2026 · 11:30", action: "Teleconsultation completed", coins: 8, badge: "📹", balance: 225 },
  { date: "Jul 14, 2026 · 09:00", action: "Daily login", coins: 2, badge: "", balance: 217 },
  { date: "Jul 13, 2026 · 16:00", action: "Write e-prescription", coins: 2, badge: "", balance: 215 },
  { date: "Jul 13, 2026 · 10:00", action: "7-day streak bonus!", coins: 25, badge: "🔥", balance: 213 },
];

const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🏅" },
  { value: "onboarding", label: "Onboarding", emoji: "🚀" },
  { value: "consistency", label: "Consistency", emoji: "🔥" },
  { value: "clinical", label: "Clinical", emoji: "🩺" },
  { value: "quality", label: "Quality", emoji: "⭐" },
  { value: "growth", label: "Growth", emoji: "📈" },
  { value: "teamwork", label: "Teamwork", emoji: "🤝" },
  { value: "milestones", label: "Milestones", emoji: "🏆" },
];

const DoctorAchievements = () => {
  const [filterCat, setFilterCat] = useState("all");

  const filteredBadges = filterCat === "all" ? doctorBadges : doctorBadges.filter(b => b.category === filterCat);
  const earnedCount = earnedBadgeIds.length;
  const totalBadges = doctorBadges.length;
  const completionPct = Math.round((earnedCount / totalBadges) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            🏆 Achievement Center
          </h1>
          <p className="text-sm text-muted-foreground">Monitor your achievements, badges & Ayuzee Coins</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info("Checking for new badges...")}>
          ⭐ Check New Badges
        </Button>
      </div>

      {/* Ayuzee Coins Card */}
      <Card className="bg-gradient-to-r from-amber-900/90 to-amber-800/90 text-white border-amber-700">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">🪙 Ayuzee Coins</h2>
            <div className="flex items-center gap-1 bg-amber-600/50 px-3 py-1 rounded-full">
              <span className="text-xl">💰</span>
              <span className="text-xl font-bold">{userCoins}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-700/40 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-200">Today</p>
              <p className="text-lg font-bold">+10 💰</p>
            </div>
            <div className="bg-amber-700/40 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-200">This Week</p>
              <p className="text-lg font-bold">+68 💰</p>
            </div>
            <div className="bg-amber-700/40 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-200">This Month</p>
              <p className="text-lg font-bold">+245 💰</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rank & Progress */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentRank?.emoji}</span>
            <div>
              <h3 className="text-xl font-bold">{currentRank?.name}</h3>
              <p className="text-sm text-slate-300">{userPoints} Points</p>
            </div>
            <Badge className="ml-auto bg-slate-700 text-slate-200">{userPoints} pts</Badge>
          </div>
          {nextRank && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress to {nextRank.emoji} {nextRank.name}</span>
                <span>{Math.round(((userPoints - (currentRank?.minPoints || 0)) / (nextRank.minPoints - (currentRank?.minPoints || 0))) * 100)}%</span>
              </div>
              <Progress value={((userPoints - (currentRank?.minPoints || 0)) / (nextRank.minPoints - (currentRank?.minPoints || 0))) * 100} className="h-3 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-400" />
              <p className="text-xs text-slate-400 mt-1">{nextRank.minPoints - userPoints} points to next rank</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-slate-900 text-white border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{earnedCount}</p>
            <p className="text-xs text-slate-400">Badges Earned</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{userPoints}</p>
            <p className="text-xs text-slate-400">Total Points</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{completionPct}%</p>
            <p className="text-xs text-slate-400">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalBadges - earnedCount}</p>
            <p className="text-xs text-slate-400">Badges to Unlock</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Badges / Coin Rules / History */}
      <Tabs defaultValue="badges">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="badges">🏅 My Badges</TabsTrigger>
          <TabsTrigger value="earn">💰 How to Earn</TabsTrigger>
          <TabsTrigger value="history">📜 Coin History</TabsTrigger>
        </TabsList>

        {/* BADGES TAB */}
        <TabsContent value="badges" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button key={cat.value} size="sm" variant={filterCat === cat.value ? "default" : "outline"} onClick={() => setFilterCat(cat.value)} className="text-xs">
                {cat.emoji} {cat.label}
              </Button>
            ))}
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBadges.map((badge) => {
              const earned = earnedBadgeIds.includes(badge.id);
              return (
                <Card key={badge.id} className={`relative transition hover:shadow-lg ${earned ? getRarityColor(badge.rarity) : "bg-slate-50 border-slate-200 opacity-60"} ${badge.rarity === "legendary" ? "ring-2 ring-amber-400" : ""}`}>
                  <CardContent className="p-4">
                    {/* Rarity badge */}
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`text-[9px] capitalize ${getRarityBadgeColor(badge.rarity)}`}>
                        {badge.category}
                      </Badge>
                      <Badge className={`text-[9px] capitalize ${getRarityBadgeColor(badge.rarity)}`}>
                        {badge.rarity}
                      </Badge>
                    </div>
                    {/* Emoji icon */}
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    {/* Name & description */}
                    <p className="font-bold text-sm">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
                    {/* Points */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs">🪙</span>
                      <span className="text-xs font-bold">{badge.points}pts</span>
                    </div>
                    {/* Earned indicator */}
                    {earned && (
                      <div className="absolute top-2 right-2">
                        <span className="text-green-500 text-lg">✅</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* HOW TO EARN TAB */}
        <TabsContent value="earn" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">💰 Ways to Earn Ayuzee Coins</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctorCoinRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rule.emoji}</span>
                      <span className="text-sm">{rule.action}</span>
                    </div>
                    <Badge variant="outline" className="font-bold text-amber-700 bg-amber-50">+{rule.coins} 🪙</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Streak Info */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <p className="font-bold text-lg">{userStreak}-Day Streak!</p>
                <p className="text-sm text-muted-foreground">Keep logging in daily to maintain your streak. 7-day = +25 coins, 30-day = +100 coins!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COIN HISTORY TAB */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">📜 My Coin History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Every coin earned or spent — reward cards, badges, shout outs, gifts, payouts.</p>
              <div className="space-y-2">
                {coinHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">+{entry.coins} 🪙</Badge>
                      {entry.badge && <span>{entry.badge}</span>}
                      <div>
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Bal: {entry.balance}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Motivational footer */}
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-1">🎯</p>
              <p className="font-bold text-emerald-700">Keep Going, Champion!</p>
              <p className="text-xs text-emerald-600 mt-1">Every consultation completed, every patient helped, and every milestone reached brings you closer to new badges and recognition. Your journey to excellence continues!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorAchievements;
