import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Medal, Star, Target, Zap, Gift, Crown, TrendingUp,
  Users, IndianRupee, Sparkles, Brain, Heart, Flame, Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type StaffIncentive = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  points: number;
  level: number;
  streak: number;
  badges: string[];
  incentiveEarned: number;
  targetAchieved: number;
  targetGoal: number;
  rank: number;
  afoofaGoals: { goal: string; progress: number; reward: number }[];
};

const staffIncentives: StaffIncentive[] = [
  {
    id: "1", name: "Dr. Sivarama Krishnan", role: "Consultant", points: 2450, level: 8,
    streak: 12, badges: ["Top Performer", "100% Attendance", "Patient Favorite"],
    incentiveEarned: 28000, targetAchieved: 89, targetGoal: 100, rank: 1,
    afoofaGoals: [
      { goal: "Achieve ₹2L consultation revenue", progress: 89, reward: 15000 },
      { goal: "100 patient consultations", progress: 85, reward: 8000 },
      { goal: "5-star patient rating >90%", progress: 92, reward: 5000 },
    ]
  },
  {
    id: "2", name: "Priya (Pharmacist)", role: "Pharmacist", points: 1820, level: 6,
    streak: 8, badges: ["Sales Star", "Zero Errors"],
    incentiveEarned: 12000, targetAchieved: 78, targetGoal: 100, rank: 2,
    afoofaGoals: [
      { goal: "₹1.5L pharmacy sales", progress: 78, reward: 8000 },
      { goal: "Zero billing errors month", progress: 100, reward: 3000 },
      { goal: "50 OTC upsells", progress: 62, reward: 4000 },
    ]
  },
  {
    id: "3", name: "Kumar (Reception)", role: "Senior Cashier", points: 1540, level: 5,
    streak: 15, badges: ["Streak Master", "Early Bird"],
    incentiveEarned: 8000, targetAchieved: 90, targetGoal: 100, rank: 3,
    afoofaGoals: [
      { goal: "200 patients handled/month", progress: 90, reward: 5000 },
      { goal: "Maintain 15-day streak", progress: 100, reward: 2000 },
      { goal: "Zero missed appointments", progress: 95, reward: 3000 },
    ]
  },
  {
    id: "4", name: "Lakshmi (Therapist)", role: "Panchakarma Therapist", points: 1280, level: 5,
    streak: 6, badges: ["Therapy Expert"],
    incentiveEarned: 9500, targetAchieved: 72, targetGoal: 100, rank: 4,
    afoofaGoals: [
      { goal: "60 therapy sessions/month", progress: 72, reward: 6000 },
      { goal: "₹1.2L panchakarma revenue", progress: 68, reward: 5000 },
      { goal: "Patient satisfaction >95%", progress: 88, reward: 3000 },
    ]
  },
  {
    id: "5", name: "Anitha (Lab)", role: "Lab Technician", points: 980, level: 4,
    streak: 4, badges: ["Accurate Analyst"],
    incentiveEarned: 5500, targetAchieved: 65, targetGoal: 100, rank: 5,
    afoofaGoals: [
      { goal: "Process 150 tests/month", progress: 65, reward: 4000 },
      { goal: "Report TAT < 2 hours", progress: 78, reward: 3000 },
      { goal: "Zero sample rejections", progress: 90, reward: 2000 },
    ]
  },
];

const leaderboardData = staffIncentives.map(s => ({
  name: s.name.split(" ")[0] + (s.name.includes("(") ? " " + s.name.split("(")[1]?.replace(")", "") : ""),
  points: s.points,
  incentive: s.incentiveEarned,
}));

const rewardTiers = [
  { tier: "Bronze", minPoints: 0, maxPoints: 500, perks: "₹500 bonus, Certificate", color: "text-amber-700 bg-amber-50" },
  { tier: "Silver", minPoints: 500, maxPoints: 1000, perks: "₹1,500 bonus, 1 day extra leave", color: "text-gray-600 bg-gray-50" },
  { tier: "Gold", minPoints: 1000, maxPoints: 2000, perks: "₹3,000 bonus, 2 days leave, Gift voucher", color: "text-yellow-600 bg-yellow-50" },
  { tier: "Platinum", minPoints: 2000, maxPoints: 3000, perks: "₹5,000 bonus, 3 days leave, Premium gift", color: "text-purple-600 bg-purple-50" },
  { tier: "Diamond", minPoints: 3000, maxPoints: 99999, perks: "₹10,000 bonus, Trip reward, Special recognition", color: "text-blue-600 bg-blue-50" },
];

const IncentiveGamification = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Incentive & Gamification (Afoofa Points)
          </h2>
          <p className="text-sm text-muted-foreground">Performance-based rewards, leaderboards & goal tracking connected to Afoofa</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Target className="mr-1 h-4 w-4" /> Set Goals</Button>
          <Button size="sm"><Gift className="mr-1 h-4 w-4" /> Award Points</Button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid gap-4 grid-cols-3">
        {staffIncentives.slice(0, 3).map((s, i) => (
          <Card key={s.id} className={i === 0 ? "border-yellow-300 bg-yellow-50/30" : i === 1 ? "border-gray-300" : "border-amber-200"}>
            <CardContent className="p-4 text-center">
              <div className="mb-2">
                {i === 0 && <Crown className="h-6 w-6 text-yellow-500 mx-auto" />}
                {i === 1 && <Medal className="h-6 w-6 text-gray-400 mx-auto" />}
                {i === 2 && <Medal className="h-6 w-6 text-amber-600 mx-auto" />}
              </div>
              <p className="font-display text-lg font-bold">#{s.rank}</p>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.role}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge className="bg-primary/10 text-primary">
                  <Zap className="mr-1 h-3 w-3" />{s.points} pts
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Flame className="mr-1 h-3 w-3 text-orange-500" />{s.streak} days
                </Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-green-600">₹{s.incentiveEarned.toLocaleString("en-IN")} earned</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="goals">Afoofa Goals</TabsTrigger>
          <TabsTrigger value="badges">Badges & Rewards</TabsTrigger>
          <TabsTrigger value="incentives">Incentive Report</TabsTrigger>
          <TabsTrigger value="tiers">Reward Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Points & Incentive Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leaderboardData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="points" fill="#f97316" name="Points" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {staffIncentives.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        #{s.rank}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">Lv.{s.level}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Flame className="h-3 w-3 text-orange-500" />{s.streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-primary">{s.points}</p>
                        <p className="text-[10px] text-muted-foreground">points</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-lg font-bold text-green-600">₹{(s.incentiveEarned / 1000).toFixed(1)}K</p>
                        <p className="text-[10px] text-muted-foreground">earned</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-lg font-bold">{s.targetAchieved}%</p>
                        <p className="text-[10px] text-muted-foreground">target</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.badges.map((badge, i) => (
                      <Badge key={i} className="bg-amber-100 text-amber-700 text-[10px]">
                        <Star className="mr-0.5 h-2.5 w-2.5" />{badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">Afoofa Goals Integration</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Every staff member connects to Afoofa gamification platform. Points earned here contribute to their 
                    overall Afoofa score, unlocking rewards, badges, and career growth opportunities across the ecosystem.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {staffIncentives.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
                  <Badge className="bg-primary/10 text-primary">{s.points} Afoofa Points</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {s.afoofaGoals.map((goal, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{goal.goal}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">₹{goal.reward.toLocaleString("en-IN")} reward</Badge>
                          <span className="font-semibold">{goal.progress}%</span>
                        </div>
                      </div>
                      <Progress value={goal.progress} className={`h-2 ${goal.progress >= 90 ? "[&>div]:bg-green-500" : goal.progress >= 70 ? "[&>div]:bg-amber-500" : ""}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Top Performer", icon: Crown, description: "Achieve 100% monthly target", color: "text-yellow-600 bg-yellow-50" },
              { name: "Sales Star", icon: Star, description: "Highest sales in any week", color: "text-amber-600 bg-amber-50" },
              { name: "Streak Master", icon: Flame, description: "15+ day attendance streak", color: "text-orange-600 bg-orange-50" },
              { name: "Patient Favorite", icon: Heart, description: "Consistently >95% patient satisfaction", color: "text-red-600 bg-red-50" },
              { name: "Zero Errors", icon: Target, description: "No billing/dispensing errors for 30 days", color: "text-green-600 bg-green-50" },
              { name: "Early Bird", icon: Zap, description: "Punctual attendance 30 days straight", color: "text-blue-600 bg-blue-50" },
              { name: "Team Player", icon: Users, description: "Help colleagues 10+ times/month", color: "text-purple-600 bg-purple-50" },
              { name: "Revenue Champion", icon: IndianRupee, description: "Generate highest revenue in branch", color: "text-green-600 bg-green-50" },
              { name: "Learning Enthusiast", icon: Award, description: "Complete 5 training modules", color: "text-indigo-600 bg-indigo-50" },
            ].map((badge, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${badge.color}`}>
                    <badge.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incentives" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Incentive Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Staff</th>
                      <th className="px-4 py-2 text-left font-medium">Role</th>
                      <th className="px-4 py-2 text-center font-medium">Target %</th>
                      <th className="px-4 py-2 text-center font-medium">Points</th>
                      <th className="px-4 py-2 text-right font-medium">Incentive Earned</th>
                      <th className="px-4 py-2 text-right font-medium">Potential (if 100%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffIncentives.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{s.name}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{s.role}</td>
                        <td className="px-4 py-2 text-center">
                          <Badge className={s.targetAchieved >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                            {s.targetAchieved}%
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-center font-semibold">{s.points}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">₹{s.incentiveEarned.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                          ₹{(s.afoofaGoals.reduce((sum, g) => sum + g.reward, 0)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-muted/30">
                      <td className="px-4 py-2" colSpan={4}>Total</td>
                      <td className="px-4 py-2 text-right text-green-600">
                        ₹{staffIncentives.reduce((s, i) => s + i.incentiveEarned, 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        ₹{staffIncentives.reduce((s, i) => s + i.afoofaGoals.reduce((sum, g) => sum + g.reward, 0), 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4 mt-4">
          <div className="space-y-3">
            {rewardTiers.map((tier, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full font-semibold text-sm ${tier.color}`}>
                      {tier.tier}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tier.minPoints} - {tier.maxPoints === 99999 ? "∞" : tier.maxPoints} points</p>
                      <p className="text-xs text-muted-foreground">{tier.perks}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {staffIncentives.filter(s => s.points >= tier.minPoints && s.points < tier.maxPoints).length} staff
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncentiveGamification;
