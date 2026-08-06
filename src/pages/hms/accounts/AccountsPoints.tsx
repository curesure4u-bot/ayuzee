import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Zap, Star, Target, Gift, Crown, TrendingUp, Medal,
  ReceiptText, Shield, Wallet, Users, IndianRupee, Brain, Sparkles,
  CheckCircle2, Flame, ArrowUpRight, Award, Heart
} from "lucide-react";

type PointActivity = {
  id: string;
  activity: string;
  category: string;
  pointsEarned: number;
  user: string;
  timestamp: string;
  description: string;
};

type PointRule = {
  id: string;
  activity: string;
  category: string;
  points: number;
  condition: string;
  bonusMultiplier?: number;
  bonusCondition?: string;
  active: boolean;
};

const pointRules: PointRule[] = [
  { id: "1", activity: "Bill Generated", category: "Billing", points: 5, condition: "Per bill created", bonusMultiplier: 2, bonusCondition: "Bill > ₹5,000", active: true },
  { id: "2", activity: "Payment Collected (Cash)", category: "Collection", points: 3, condition: "Per cash payment received", active: true },
  { id: "3", activity: "Payment Collected (Digital)", category: "Collection", points: 5, condition: "Per UPI/Card payment", bonusMultiplier: 1.5, bonusCondition: "First-time digital patient", active: true },
  { id: "4", activity: "Due Payment Recovered", category: "Collection", points: 10, condition: "Per overdue payment collected", bonusMultiplier: 3, bonusCondition: "Due > 30 days recovered", active: true },
  { id: "5", activity: "Bank Reconciliation (Correct)", category: "Reconciliation", points: 2, condition: "Per correctly reconciled transaction", active: true },
  { id: "6", activity: "Full Day Reconciliation", category: "Reconciliation", points: 25, condition: "100% match for the day", bonusMultiplier: 2, bonusCondition: "Zero mismatches", active: true },
  { id: "7", activity: "Expense Entry with Receipt", category: "Expense", points: 3, condition: "Per expense with uploaded receipt", active: true },
  { id: "8", activity: "Expense Optimization", category: "Expense", points: 15, condition: "Identified cost saving > ₹1,000", active: true },
  { id: "9", activity: "Staff Credit Settlement", category: "Staff", points: 8, condition: "Per staff credit settled on time", active: true },
  { id: "10", activity: "Supplier Payment on Time", category: "Supplier", points: 10, condition: "Paid before due date", bonusMultiplier: 1.5, bonusCondition: "3 consecutive on-time", active: true },
  { id: "11", activity: "Target Achievement (Daily)", category: "Target", points: 20, condition: "Hit 100% daily revenue target", bonusMultiplier: 3, bonusCondition: "Exceed by 20%+", active: true },
  { id: "12", activity: "Target Achievement (Monthly)", category: "Target", points: 100, condition: "Hit monthly target", bonusMultiplier: 5, bonusCondition: "First branch to hit target", active: true },
  { id: "13", activity: "Zero Error Day (Cashier)", category: "Accuracy", points: 15, condition: "No billing errors in shift", active: true },
  { id: "14", activity: "Day Close Match", category: "Accuracy", points: 10, condition: "Cash count matches system", active: true },
  { id: "15", activity: "Patient Follow-up Conversion", category: "Follow-up", points: 8, condition: "Follow-up leads to payment/visit", active: true },
  { id: "16", activity: "QR Payment Received", category: "Digital", points: 5, condition: "Payment via QR code link", active: true },
  { id: "17", activity: "CRM Data Entry", category: "CRM", points: 2, condition: "Per complete CRM record update", active: true },
  { id: "18", activity: "Insurance Claim Approved", category: "Insurance", points: 20, condition: "Per successful insurance claim", active: true },
];

const recentActivities: PointActivity[] = [
  { id: "1", activity: "Bill Generated", category: "Billing", pointsEarned: 10, user: "Kumar (Cashier)", timestamp: "3:15 PM", description: "BILL-2152 for ₹5,200 (2x bonus)" },
  { id: "2", activity: "Payment Collected (Digital)", category: "Collection", pointsEarned: 5, user: "Kumar (Cashier)", timestamp: "3:10 PM", description: "GPay ₹2,500 from Rajesh Kumar" },
  { id: "3", activity: "Due Payment Recovered", category: "Collection", pointsEarned: 30, user: "Priya (Front Desk)", timestamp: "2:45 PM", description: "₹8,500 (45-day overdue) from Anand Sharma (3x bonus)" },
  { id: "4", activity: "Bank Reconciliation (Correct)", category: "Reconciliation", pointsEarned: 2, user: "Admin", timestamp: "2:30 PM", description: "Verified UPI/426789123456 ₹2,500" },
  { id: "5", activity: "Expense Entry with Receipt", category: "Expense", pointsEarned: 3, user: "Kumar (Cashier)", timestamp: "2:00 PM", description: "AC repair ₹3,500 with photo receipt" },
  { id: "6", activity: "QR Payment Received", category: "Digital", pointsEarned: 5, user: "System", timestamp: "1:30 PM", description: "QR scan payment ₹1,800 from Sunita Devi" },
  { id: "7", activity: "Patient Follow-up Conversion", category: "Follow-up", pointsEarned: 8, user: "Priya (Front Desk)", timestamp: "12:00 PM", description: "Lakshmi Narayan booked appointment after reminder" },
  { id: "8", activity: "Target Achievement (Daily)", category: "Target", pointsEarned: 20, user: "Branch (Kadayanallur)", timestamp: "Yesterday", description: "Hit ₹60K daily target" },
  { id: "9", activity: "Zero Error Day (Cashier)", category: "Accuracy", pointsEarned: 15, user: "Priya (Pharmacy)", timestamp: "Yesterday", description: "Zero billing errors - full shift" },
  { id: "10", activity: "Supplier Payment on Time", category: "Supplier", pointsEarned: 15, user: "Admin", timestamp: "Yesterday", description: "Himalaya Wellness - 3rd consecutive on-time (1.5x)" },
];

type StaffPointsSummary = {
  name: string;
  role: string;
  totalPoints: number;
  thisMonth: number;
  streak: number;
  level: number;
  topCategory: string;
  afoofaSync: boolean;
};

const staffPoints: StaffPointsSummary[] = [
  { name: "Kumar (Senior Cashier)", role: "Cashier", totalPoints: 1845, thisMonth: 420, streak: 12, level: 7, topCategory: "Billing", afoofaSync: true },
  { name: "Priya (Front Desk)", role: "Reception", totalPoints: 1620, thisMonth: 385, streak: 8, level: 6, topCategory: "Follow-up", afoofaSync: true },
  { name: "Admin", role: "Administrator", totalPoints: 2250, thisMonth: 510, streak: 15, level: 8, topCategory: "Reconciliation", afoofaSync: true },
  { name: "Anitha (Lab)", role: "Lab Technician", totalPoints: 890, thisMonth: 180, streak: 4, level: 4, topCategory: "Billing", afoofaSync: true },
  { name: "Priya (Pharmacy)", role: "Pharmacist", totalPoints: 1350, thisMonth: 310, streak: 9, level: 5, topCategory: "Accuracy", afoofaSync: true },
];

const accountsBadges = [
  { name: "Billing Pro", icon: ReceiptText, description: "Generate 500+ bills", threshold: 500, color: "text-orange-600 bg-orange-50" },
  { name: "Collection King", icon: IndianRupee, description: "Collect ₹10L+ in dues", threshold: 1000000, color: "text-green-600 bg-green-50" },
  { name: "Reconciliation Master", icon: Shield, description: "30 days zero mismatch", threshold: 30, color: "text-blue-600 bg-blue-50" },
  { name: "Digital Champion", icon: Zap, description: "100+ QR payments facilitated", threshold: 100, color: "text-purple-600 bg-purple-50" },
  { name: "Expense Guardian", icon: Wallet, description: "Save ₹50K+ via optimization", threshold: 50000, color: "text-red-600 bg-red-50" },
  { name: "Target Crusher", icon: Target, description: "Hit target 20 days/month", threshold: 20, color: "text-amber-600 bg-amber-50" },
  { name: "Follow-up Hero", icon: Heart, description: "Convert 50+ follow-ups", threshold: 50, color: "text-pink-600 bg-pink-50" },
  { name: "CRM Expert", icon: Users, description: "Maintain 100% CRM accuracy", threshold: 100, color: "text-indigo-600 bg-indigo-50" },
  { name: "Streak Warrior", icon: Flame, description: "30-day activity streak", threshold: 30, color: "text-orange-600 bg-orange-50" },
];

const AccountsPoints = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const totalPointsToday = recentActivities.reduce((s, a) => s + a.pointsEarned, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Accounts Afoofa Points
          </h2>
          <p className="text-sm text-muted-foreground">
            Earn points for every accounts activity — billing, collections, reconciliation & more
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Award className="mr-1 h-4 w-4" /> Redeem Points</Button>
          <Button size="sm"><Gift className="mr-1 h-4 w-4" /> Reward Staff</Button>
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="font-display text-2xl font-bold text-primary">{totalPointsToday}</p>
            <p className="text-xs text-muted-foreground">Points Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <p className="font-display text-2xl font-bold">1,805</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="h-6 w-6 mx-auto mb-1 text-purple-500" />
            <p className="font-display text-2xl font-bold">7,955</p>
            <p className="text-xs text-muted-foreground">All-Time (Branch)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
            <p className="font-display text-2xl font-bold">15</p>
            <p className="text-xs text-muted-foreground">Best Streak (days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="font-display text-2xl font-bold">6/9</p>
            <p className="text-xs text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Afoofa Sync Status */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">Connected to Afoofa Goals Platform</p>
                <p className="text-xs text-muted-foreground">
                  All accounts points auto-sync to each user's Afoofa profile. Points contribute to overall leaderboard, 
                  badges, and career milestones across the ecosystem.
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Synced</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Live Activity</TabsTrigger>
          <TabsTrigger value="rules">Point Rules</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Live Activity Feed */}
        <TabsContent value="overview" className="space-y-3 mt-4">
          {recentActivities.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{a.activity}</p>
                      <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.user} · {a.timestamp}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-primary">+{a.pointsEarned}</p>
                  <p className="text-[10px] text-muted-foreground">points</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Point Rules */}
        <TabsContent value="rules" className="space-y-3 mt-4">
          <Card className="border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700">How Points Work</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Every accounts-related activity earns Afoofa points. Bonus multipliers activate on exceptional 
                    performance. Points sync to the global Afoofa platform for rewards, badges, and recognition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Activity</th>
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-center font-medium">Points</th>
                      <th className="px-4 py-2 text-left font-medium">Condition</th>
                      <th className="px-4 py-2 text-center font-medium">Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointRules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{rule.activity}</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className="text-[10px]">{rule.category}</Badge>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="font-display font-bold text-primary">+{rule.points}</span>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{rule.condition}</td>
                        <td className="px-4 py-2 text-center">
                          {rule.bonusMultiplier ? (
                            <div>
                              <Badge className="bg-amber-100 text-amber-700 text-[10px]">{rule.bonusMultiplier}x</Badge>
                              <p className="text-[9px] text-muted-foreground mt-0.5">{rule.bonusCondition}</p>
                            </div>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-3 mt-4">
          {staffPoints.map((s, i) => (
            <Card key={i} className={i === 0 ? "border-yellow-300 bg-yellow-50/20" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-700" :
                      i === 2 ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">Lv.{s.level}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-orange-500" />{s.streak} days
                        </span>
                        <span className="text-[10px] text-muted-foreground">Top: {s.topCategory}</span>
                        {s.afoofaSync && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-display text-lg font-bold text-primary">{s.thisMonth}</p>
                      <p className="text-[10px] text-muted-foreground">this month</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-lg font-bold">{s.totalPoints.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">all-time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accountsBadges.map((badge, i) => {
              const earned = i < 6;
              return (
                <Card key={i} className={earned ? "border-green-200" : "opacity-60"}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${badge.color}`}>
                      <badge.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{badge.name}</p>
                        {earned ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Locked</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                      {!earned && (
                        <Progress value={45} className="mt-2 h-1.5" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountsPoints;
