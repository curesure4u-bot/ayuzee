import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Award, Users, IndianRupee, Gift, Star, TrendingUp, Crown, Heart, History, Share2, Search, Loader2 } from "lucide-react";
import { useLoyalty } from "@/hooks/useLoyalty";

type Tier = { name: string; icon: React.ReactNode; minSpend: number; discount: number; benefits: string[]; members: number; color: string };

const tiers: Tier[] = [
  { name: "Silver", icon: <Star className="h-5 w-5" />, minSpend: 0, discount: 5, benefits: ["5% on medicines", "Birthday greeting", "Priority booking"], members: 2, color: "text-slate-500 bg-slate-100" },
  { name: "Gold", icon: <Award className="h-5 w-5" />, minSpend: 50000, discount: 10, benefits: ["10% on packages", "Free follow-up", "Dedicated support", "Partner discounts"], members: 2, color: "text-amber-600 bg-amber-100" },
  { name: "Platinum", icon: <Crown className="h-5 w-5" />, minSpend: 150000, discount: 15, benefits: ["15% on all services", "Free annual checkup", "Complimentary therapy/year", "VIP lounge", "Home visit priority"], members: 2, color: "text-purple-600 bg-purple-100" },
];

type Redemption = { id: string; patient: string; date: string; pointsUsed: number; reward: string; value: string };
type Referral = { id: string; referrer: string; referred: string; date: string; status: "visited" | "pending" | "expired"; pointsAwarded: number };
type PointsActivity = { id: string; patient: string; date: string; action: string; points: number; type: "earned" | "redeemed" };

const mockRedemptions: Redemption[] = [
  { id: "RD-1", patient: "Ramesh Kumar", date: "2026-08-05", pointsUsed: 1000, reward: "Free Abhyanga Massage", value: "₹1,500" },
  { id: "RD-2", patient: "Kavitha R.", date: "2026-08-02", pointsUsed: 500, reward: "₹50 off consultation", value: "₹50" },
  { id: "RD-3", patient: "Lakshmi Devi", date: "2026-07-28", pointsUsed: 2000, reward: "10% off PK package", value: "₹2,400" },
  { id: "RD-4", patient: "Priya Menon", date: "2026-07-20", pointsUsed: 800, reward: "Free medicine delivery", value: "₹80" },
];

const mockReferrals: Referral[] = [
  { id: "RF-1", referrer: "Ramesh Kumar", referred: "Anil Krishnan", date: "2026-08-03", status: "visited", pointsAwarded: 500 },
  { id: "RF-2", referrer: "Kavitha R.", referred: "Meena Nair", date: "2026-08-05", status: "visited", pointsAwarded: 500 },
  { id: "RF-3", referrer: "Priya Menon", referred: "Suresh B.", date: "2026-08-06", status: "pending", pointsAwarded: 0 },
  { id: "RF-4", referrer: "Lakshmi Devi", referred: "Ravi Kumar", date: "2026-07-15", status: "expired", pointsAwarded: 0 },
];

const mockActivity: PointsActivity[] = [
  { id: "PA-1", patient: "Ramesh Kumar", date: "2026-08-07", action: "Consultation visit", points: 50, type: "earned" },
  { id: "PA-2", patient: "Kavitha R.", date: "2026-08-07", action: "Panchakarma session", points: 150, type: "earned" },
  { id: "PA-3", patient: "Ramesh Kumar", date: "2026-08-05", action: "Redeemed: Free Abhyanga", points: -1000, type: "redeemed" },
  { id: "PA-4", patient: "Priya Menon", date: "2026-08-06", action: "Google review bonus", points: 200, type: "earned" },
  { id: "PA-5", patient: "Lakshmi Devi", date: "2026-08-05", action: "Online booking bonus", points: 25, type: "earned" },
  { id: "PA-6", patient: "Ramesh Kumar", date: "2026-08-03", action: "Referral: Anil Krishnan visited", points: 500, type: "earned" },
  { id: "PA-7", patient: "Sunil Menon", date: "2026-08-04", action: "Pharmacy purchase", points: 35, type: "earned" },
];

const HmsLoyalty = () => {
  const { members, loading, error, totalPoints, totalLifetimeValue } = useLoyalty();
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");

  const filteredMembers = members.filter(m => {
    if (filterTier !== "all" && m.tier !== filterTier) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="rules">Points Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Tiers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{m.name}</td>
                    <td className="px-3 py-2"><Badge className={`text-[10px] capitalize ${tiers.find(t => t.name.toLowerCase() === m.tier)?.color}`}>{m.tier === "platinum" ? <Crown className="h-3 w-3 mr-0.5" /> : m.tier === "gold" ? <Award className="h-3 w-3 mr-0.5" /> : <Star className="h-3 w-3 mr-0.5" />}{m.tier}</Badge></td>
                    <td className="px-3 py-2 font-bold">{m.points.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">₹{m.totalSpent.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{m.visits}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{m.nextReward}</td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No members match filters</td></tr>}
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

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Recent Points Activity</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Patient</th>
                    <th className="px-3 py-2 text-left font-medium">Action</th>
                    <th className="px-3 py-2 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {mockActivity.map(a => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.date}</td>
                      <td className="px-3 py-2 font-medium">{a.patient}</td>
                      <td className="px-3 py-2 text-xs">{a.action}</td>
                      <td className={`px-3 py-2 text-right font-bold ${a.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                        {a.type === "earned" ? "+" : ""}{a.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4" /> Redemption History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Patient</th>
                    <th className="px-3 py-2 text-left font-medium">Reward</th>
                    <th className="px-3 py-2 text-right font-medium">Points Used</th>
                    <th className="px-3 py-2 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRedemptions.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.date}</td>
                      <td className="px-3 py-2 font-medium">{r.patient}</td>
                      <td className="px-3 py-2 text-xs">{r.reward}</td>
                      <td className="px-3 py-2 text-right font-bold text-red-600">-{r.pointsUsed}</td>
                      <td className="px-3 py-2 text-right text-xs">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Share2 className="h-4 w-4" /> Referral Tracking</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockReferrals.map(ref => (
                  <div key={ref.id} className="p-3 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{ref.referrer} → {ref.referred}</p>
                      <p className="text-xs text-muted-foreground">{ref.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ref.status === "visited" ? "outline" : ref.status === "pending" ? "secondary" : "destructive"} className={`text-xs capitalize ${ref.status === "visited" ? "text-green-600" : ""}`}>{ref.status}</Badge>
                      {ref.pointsAwarded > 0 && <Badge variant="outline" className="text-xs text-green-600">+{ref.pointsAwarded} pts</Badge>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-700">Referral Program</p>
                <p className="text-xs text-blue-600 mt-0.5">Both referrer and new patient get 500 points when the referred patient completes their first visit.</p>
              </div>
            </CardContent>
          </Card>
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
