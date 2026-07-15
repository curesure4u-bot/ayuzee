import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Award, Users, IndianRupee, Gift, Star, TrendingUp, Crown, Heart } from "lucide-react";

type Member = { id: string; name: string; tier: "silver" | "gold" | "platinum"; points: number; totalSpent: number; visits: number; joinDate: string; nextReward: string };
type Tier = { name: string; icon: React.ReactNode; minSpend: number; discount: number; benefits: string[]; members: number; color: string };

const mockMembers: Member[] = [
  { id: "1", name: "Ramesh Kumar", tier: "platinum", points: 4500, totalSpent: 185000, visits: 28, joinDate: "2024-06-01", nextReward: "Free Abhyanga session" },
  { id: "2", name: "Lakshmi Devi", tier: "gold", points: 2200, totalSpent: 85000, visits: 15, joinDate: "2025-01-15", nextReward: "10% off next package" },
  { id: "3", name: "Priya Menon", tier: "gold", points: 1800, totalSpent: 72000, visits: 12, joinDate: "2025-03-20", nextReward: "Free consultation" },
  { id: "4", name: "Sunil Menon", tier: "silver", points: 900, totalSpent: 35000, visits: 8, joinDate: "2025-08-01", nextReward: "5% off medicines" },
  { id: "5", name: "Anand Sharma", tier: "silver", points: 450, totalSpent: 18000, visits: 4, joinDate: "2026-02-10", nextReward: "Welcome reward pending" },
  { id: "6", name: "Kavitha R.", tier: "platinum", points: 5200, totalSpent: 220000, visits: 35, joinDate: "2023-11-01", nextReward: "Complimentary health checkup" },
];

const tiers: Tier[] = [
  { name: "Silver", icon: <Star className="h-5 w-5" />, minSpend: 0, discount: 5, benefits: ["5% on medicines", "Birthday greeting", "Priority booking"], members: 2, color: "text-slate-500 bg-slate-100" },
  { name: "Gold", icon: <Award className="h-5 w-5" />, minSpend: 50000, discount: 10, benefits: ["10% on packages", "Free follow-up", "Dedicated support", "Partner discounts"], members: 2, color: "text-amber-600 bg-amber-100" },
  { name: "Platinum", icon: <Crown className="h-5 w-5" />, minSpend: 150000, discount: 15, benefits: ["15% on all services", "Free annual checkup", "Complimentary therapy/year", "VIP lounge", "Home visit priority"], members: 2, color: "text-purple-600 bg-purple-100" },
];

const HmsLoyalty = () => {
  const [members] = useState<Member[]>(mockMembers);
  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const totalLifetimeValue = members.reduce((s, m) => s + m.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" /> Patient Loyalty & Membership
          </h1>
          <p className="text-sm text-muted-foreground">Points system, membership tiers, auto-discounts, birthday rewards & referral incentives</p>
        </div>
        <Button size="sm"><Users className="mr-1 h-4 w-4" /> Enroll Patient</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{members.length}</p><p className="text-xs text-muted-foreground">Total Members</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Gift className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{totalPoints.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Points Earned</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹{(totalLifetimeValue/100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Lifetime Value</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">68%</p><p className="text-xs text-muted-foreground">Retention Rate</p></CardContent></Card>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
          <TabsTrigger value="rules">Points Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Tier</th>
                <th className="px-3 py-2 text-left font-medium">Points</th>
                <th className="px-3 py-2 text-left font-medium">Total Spent</th>
                <th className="px-3 py-2 text-left font-medium">Visits</th>
                <th className="px-3 py-2 text-left font-medium">Next Reward</th>
              </tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{m.name}</td>
                    <td className="px-3 py-2"><Badge className={`text-[10px] capitalize ${tiers.find(t => t.name.toLowerCase() === m.tier)?.color}`}>{m.tier === "platinum" ? <Crown className="h-3 w-3 mr-0.5" /> : m.tier === "gold" ? <Award className="h-3 w-3 mr-0.5" /> : <Star className="h-3 w-3 mr-0.5" />}{m.tier}</Badge></td>
                    <td className="px-3 py-2 font-bold">{m.points.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">₹{m.totalSpent.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{m.visits}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{m.nextReward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <Card key={tier.name} className="hover:shadow-md transition">
                <CardContent className="p-4 text-center">
                  <div className={`h-12 w-12 rounded-full mx-auto grid place-items-center ${tier.color}`}>{tier.icon}</div>
                  <h3 className="font-display font-bold text-lg mt-2">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground">Min spend: ₹{tier.minSpend.toLocaleString("en-IN")}</p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-300">{tier.discount}% Discount</Badge>
                  <div className="mt-3 text-left space-y-1">
                    {tier.benefits.map((b) => (
                      <p key={b} className="text-xs flex items-center gap-1"><Heart className="h-3 w-3 text-primary shrink-0" />{b}</p>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{tier.members} members</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Points Earning Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { action: "Every ₹100 spent on consultation", points: 10 },
                  { action: "Every ₹100 spent on Panchakarma", points: 15 },
                  { action: "Every ₹100 spent on pharmacy", points: 5 },
                  { action: "Referring a new patient (who visits)", points: 500 },
                  { action: "Writing a Google review", points: 200 },
                  { action: "Birthday bonus (annual)", points: 100 },
                  { action: "Completing feedback form", points: 50 },
                  { action: "Booking online (vs walk-in)", points: 25 },
                  { action: "Completing full Panchakarma course", points: 1000 },
                ].map((r) => (
                  <div key={r.action} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{r.action}</span>
                    <Badge variant="outline" className="font-bold">+{r.points} pts</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-700">Redemption: 100 points = ₹10 discount</p>
                <p className="text-xs text-amber-600 mt-0.5">Points can be redeemed on any service. Minimum redemption: 500 points.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsLoyalty;
