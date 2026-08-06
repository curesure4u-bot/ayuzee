import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Trophy, Target, TrendingUp, Users, Star, Award, Zap,
  CheckCircle, Clock, IndianRupee, BarChart3, Medal,
  Crown, Flame, Gift, Heart, ArrowUp, ArrowDown,
} from "lucide-react";

type StaffKPI = {
  id: string; name: string; role: string; department: string;
  points: number; streak: number; level: string;
  kpis: { metric: string; target: number; actual: number; unit: string }[];
  badges: string[]; rank: number;
};

type DepartmentTarget = {
  department: string; monthlyTarget: number; achieved: number;
  kpis: { name: string; target: number; actual: number; trend: "up" | "down" | "flat" }[];
};

const mockStaff: StaffKPI[] = [
  {
    id: "1", name: "Dr. Arun Sharma", role: "Senior Consultant", department: "Ayurveda",
    points: 4850, streak: 12, level: "Gold",
    kpis: [
      { metric: "Patients Seen/Day", target: 25, actual: 28, unit: "patients" },
      { metric: "Avg. Consultation Time", target: 15, actual: 12, unit: "min" },
      { metric: "Patient Satisfaction", target: 4.5, actual: 4.8, unit: "/5" },
      { metric: "Follow-up Adherence", target: 80, actual: 92, unit: "%" },
      { metric: "Prescription Accuracy", target: 95, actual: 98, unit: "%" },
    ],
    badges: ["Top Performer", "Patient Favorite", "Streak Master", "Research Contributor"],
    rank: 1,
  },
  {
    id: "2", name: "Dr. Meena Patel", role: "Panchakarma Head", department: "Panchakarma",
    points: 4200, streak: 8, level: "Gold",
    kpis: [
      { metric: "Patients Seen/Day", target: 15, actual: 16, unit: "patients" },
      { metric: "Treatment Completion Rate", target: 90, actual: 95, unit: "%" },
      { metric: "Patient Satisfaction", target: 4.5, actual: 4.9, unit: "/5" },
      { metric: "Revenue Generated", target: 500000, actual: 580000, unit: "₹" },
      { metric: "Therapy Utilization", target: 85, actual: 90, unit: "%" },
    ],
    badges: ["Revenue Star", "Patient Favorite", "Quality Champion"],
    rank: 2,
  },
  {
    id: "3", name: "Nurse Bhavani", role: "Head Nurse", department: "IPD",
    points: 3600, streak: 15, level: "Silver",
    kpis: [
      { metric: "Patient Rounds/Day", target: 4, actual: 5, unit: "rounds" },
      { metric: "Medication Errors", target: 0, actual: 0, unit: "count" },
      { metric: "Documentation Timeliness", target: 95, actual: 97, unit: "%" },
      { metric: "Patient Education Done", target: 90, actual: 88, unit: "%" },
      { metric: "Response Time (minutes)", target: 5, actual: 3, unit: "min" },
    ],
    badges: ["Zero Error", "Streak Master", "Team Player", "Night Owl"],
    rank: 3,
  },
  {
    id: "4", name: "Vignesh (Reception)", role: "Front Desk", department: "Reception",
    points: 2800, streak: 5, level: "Silver",
    kpis: [
      { metric: "Check-in Time", target: 3, actual: 2.5, unit: "min" },
      { metric: "Patient Wait Reduced", target: 10, actual: 12, unit: "min" },
      { metric: "Billing Accuracy", target: 99, actual: 99.5, unit: "%" },
      { metric: "Phone Calls Handled", target: 50, actual: 62, unit: "/day" },
      { metric: "Positive Feedback", target: 85, actual: 90, unit: "%" },
    ],
    badges: ["Speed Star", "Customer Delight"],
    rank: 4,
  },
  {
    id: "5", name: "Pharmacist Sindhu", role: "Chief Pharmacist", department: "Pharmacy",
    points: 3100, streak: 10, level: "Silver",
    kpis: [
      { metric: "Dispensing Accuracy", target: 99, actual: 99.8, unit: "%" },
      { metric: "Avg. Wait Time", target: 5, actual: 4, unit: "min" },
      { metric: "Stock-out Incidents", target: 2, actual: 1, unit: "/month" },
      { metric: "Expiry Alerts Actioned", target: 100, actual: 100, unit: "%" },
      { metric: "Cost Savings (Generic Sub)", target: 15, actual: 18, unit: "%" },
    ],
    badges: ["Zero Waste", "Accuracy King", "Cost Saver"],
    rank: 5,
  },
];

const mockDeptTargets: DepartmentTarget[] = [
  {
    department: "Ayurveda OPD", monthlyTarget: 800, achieved: 720,
    kpis: [
      { name: "New Patients", target: 200, actual: 185, trend: "up" },
      { name: "Return Patients", target: 600, actual: 535, trend: "up" },
      { name: "Revenue (₹L)", target: 12, actual: 10.5, trend: "up" },
      { name: "Satisfaction Score", target: 4.5, actual: 4.7, trend: "up" },
    ],
  },
  {
    department: "Panchakarma", monthlyTarget: 150, achieved: 135,
    kpis: [
      { name: "Packages Sold", target: 50, actual: 45, trend: "up" },
      { name: "Completion Rate", target: 90, actual: 92, trend: "up" },
      { name: "Revenue (₹L)", target: 18, actual: 16.2, trend: "flat" },
      { name: "Bed Occupancy %", target: 80, actual: 78, trend: "down" },
    ],
  },
  {
    department: "Pharmacy", monthlyTarget: 3000, achieved: 2750,
    kpis: [
      { name: "Prescriptions Filled", target: 3000, actual: 2750, trend: "up" },
      { name: "Revenue (₹L)", target: 8, actual: 7.2, trend: "up" },
      { name: "Stock Accuracy", target: 98, actual: 97.5, trend: "flat" },
      { name: "Avg. Turnaround (min)", target: 5, actual: 4.2, trend: "up" },
    ],
  },
  {
    department: "Lab & Diagnostics", monthlyTarget: 500, achieved: 420,
    kpis: [
      { name: "Tests Conducted", target: 500, actual: 420, trend: "up" },
      { name: "Report TAT (hrs)", target: 4, actual: 3.5, trend: "up" },
      { name: "Revenue (₹L)", target: 5, actual: 4.2, trend: "up" },
      { name: "QC Pass Rate %", target: 99, actual: 99.2, trend: "flat" },
    ],
  },
];

const pointsActions = [
  { action: "Complete patient consultation on time", points: 10, icon: <CheckCircle className="h-4 w-4" /> },
  { action: "Zero medication errors (daily)", points: 25, icon: <Star className="h-4 w-4" /> },
  { action: "Patient gives 5-star feedback", points: 50, icon: <Heart className="h-4 w-4" /> },
  { action: "Complete all documentation same-day", points: 15, icon: <Clock className="h-4 w-4" /> },
  { action: "Achieve department daily target", points: 100, icon: <Target className="h-4 w-4" /> },
  { action: "Refer patient successfully (internal)", points: 30, icon: <Users className="h-4 w-4" /> },
  { action: "Attend training/CME session", points: 75, icon: <Award className="h-4 w-4" /> },
  { action: "Submit research/case study", points: 200, icon: <Trophy className="h-4 w-4" /> },
  { action: "7-day streak (no absence)", points: 150, icon: <Flame className="h-4 w-4" /> },
  { action: "Cost-saving suggestion implemented", points: 500, icon: <IndianRupee className="h-4 w-4" /> },
];

const HmsGamificationKpi = () => {
  const [staff] = useState<StaffKPI[]>(mockStaff);
  const [deptTargets] = useState<DepartmentTarget[]>(mockDeptTargets);
  const [selectedDept, setSelectedDept] = useState("all");

  const totalPoints = staff.reduce((s, st) => s + st.points, 0);
  const avgKpiScore = 87; // Calculated

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> HMS Gamification & KPI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Staff performance scoring · Department targets · Achievement tracking · AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="ayurveda">Ayurveda</SelectItem>
              <SelectItem value="panchakarma">Panchakarma</SelectItem>
              <SelectItem value="pharmacy">Pharmacy</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
              <SelectItem value="nursing">Nursing</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => toast.success("Monthly report generated")}>
            <BarChart3 className="mr-1 h-4 w-4" /> Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-xl font-bold mt-1">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Points (Team)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-xl font-bold mt-1">{avgKpiScore}%</p>
            <p className="text-xs text-muted-foreground">Avg KPI Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="h-5 w-5 mx-auto text-orange-600" />
            <p className="text-xl font-bold mt-1">{Math.max(...staff.map(s => s.streak))} days</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Medal className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-xl font-bold mt-1">{staff.reduce((s, st) => s + st.badges.length, 0)}</p>
            <p className="text-xs text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-xl font-bold mt-1">+12%</p>
            <p className="text-xs text-muted-foreground">vs Last Month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="kpi">KPI Tracker</TabsTrigger>
          <TabsTrigger value="departments">Dept Targets</TabsTrigger>
          <TabsTrigger value="points">Points System</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" /> Staff Leaderboard — This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Rank</th>
                      <th className="px-3 py-2 text-left font-medium">Staff</th>
                      <th className="px-3 py-2 text-left font-medium">Department</th>
                      <th className="px-3 py-2 text-left font-medium">Level</th>
                      <th className="px-3 py-2 text-left font-medium">Points</th>
                      <th className="px-3 py-2 text-left font-medium">Streak</th>
                      <th className="px-3 py-2 text-left font-medium">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.sort((a, b) => a.rank - b.rank).map((s, idx) => (
                      <tr key={s.id} className={`border-b hover:bg-muted/30 ${idx === 0 ? "bg-amber-50/40" : ""}`}>
                        <td className="px-3 py-2">
                          {idx === 0 ? <Crown className="h-5 w-5 text-amber-500" /> :
                           idx === 1 ? <Medal className="h-5 w-5 text-slate-400" /> :
                           idx === 2 ? <Medal className="h-5 w-5 text-amber-700" /> :
                           <span className="font-bold text-muted-foreground">#{s.rank}</span>}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.role}</p>
                        </td>
                        <td className="px-3 py-2 text-xs">{s.department}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] ${s.level === "Gold" ? "text-amber-600 border-amber-300" : "text-slate-600 border-slate-300"}`}>
                            {s.level === "Gold" ? <Star className="h-3 w-3 mr-0.5" /> : <Award className="h-3 w-3 mr-0.5" />}
                            {s.level}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-bold text-amber-600">{s.points.toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-1 text-xs">
                            <Flame className="h-3 w-3 text-orange-500" /> {s.streak} days
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {s.badges.slice(0, 2).map(b => (
                              <Badge key={b} variant="secondary" className="text-[9px] px-1">{b}</Badge>
                            ))}
                            {s.badges.length > 2 && <Badge variant="secondary" className="text-[9px] px-1">+{s.badges.length - 2}</Badge>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Tracker Tab */}
        <TabsContent value="kpi" className="space-y-4">
          {staff.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{s.name} — {s.department}</CardTitle>
                  <Badge variant="outline" className="text-xs">{s.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {s.kpis.map((kpi) => {
                    const pct = Math.min(100, Math.round((kpi.actual / kpi.target) * 100));
                    const isGood = pct >= 100;
                    return (
                      <div key={kpi.metric} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{kpi.metric}</span>
                          <span className={`font-bold ${isGood ? "text-green-600" : pct >= 80 ? "text-amber-600" : "text-red-600"}`}>
                            {kpi.actual}{kpi.unit} / {kpi.target}{kpi.unit}
                          </span>
                        </div>
                        <Progress value={pct} className={`h-2 ${isGood ? "[&>div]:bg-green-500" : pct >= 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"}`} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Department Targets Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deptTargets.map((dept) => {
              const pct = Math.round((dept.achieved / dept.monthlyTarget) * 100);
              return (
                <Card key={dept.department}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{dept.department}</CardTitle>
                      <Badge variant={pct >= 90 ? "outline" : "secondary"} className={`text-xs ${pct >= 90 ? "text-green-600" : ""}`}>
                        {pct}% achieved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={pct} className="h-3 mb-3" />
                    <p className="text-xs text-muted-foreground mb-3">
                      {dept.achieved} / {dept.monthlyTarget} target (monthly)
                    </p>
                    <div className="space-y-2">
                      {dept.kpis.map((kpi) => (
                        <div key={kpi.name} className="flex items-center justify-between p-2 rounded border text-xs">
                          <span>{kpi.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{kpi.actual} / {kpi.target}</span>
                            {kpi.trend === "up" ? <ArrowUp className="h-3 w-3 text-green-600" /> :
                             kpi.trend === "down" ? <ArrowDown className="h-3 w-3 text-red-600" /> :
                             <span className="text-muted-foreground">—</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>









        {/* Points System Tab */}
        <TabsContent value="points" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Points Earning Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pointsActions.map((pa) => (
                    <div key={pa.action} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{pa.icon}</span>
                        <span className="text-sm">{pa.action}</span>
                      </div>
                      <Badge variant="outline" className="font-bold text-amber-600">+{pa.points}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Rewards & Redemption</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { reward: "Extra Half-Day Leave", cost: 2000, icon: <Clock className="h-4 w-4" /> },
                    { reward: "₹500 Gift Voucher", cost: 1500, icon: <Gift className="h-4 w-4" /> },
                    { reward: "Star Employee Certificate", cost: 3000, icon: <Award className="h-4 w-4" /> },
                    { reward: "Training Course Sponsorship", cost: 5000, icon: <Zap className="h-4 w-4" /> },
                    { reward: "Performance Bonus (₹5,000)", cost: 8000, icon: <IndianRupee className="h-4 w-4" /> },
                    { reward: "Conference Attendance", cost: 10000, icon: <Trophy className="h-4 w-4" /> },
                    { reward: "Annual Increment Boost", cost: 20000, icon: <Crown className="h-4 w-4" /> },
                  ].map((r) => (
                    <div key={r.reward} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">{r.icon}</span>
                        <span className="text-sm">{r.reward}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success(`Redeemed: ${r.reward}`)}>
                        {r.cost.toLocaleString()} pts
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-4">
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" /> AI Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { insight: "Dr. Arun's patient satisfaction is 6.7% above target — consider sharing his communication techniques with the team", type: "positive" },
                  { insight: "Panchakarma bed occupancy dropped 2% this week. Suggest: Increase follow-up calls to waitlisted patients", type: "action" },
                  { insight: "Nurse Bhavani has maintained zero medication errors for 45 days — Recommend for 'Excellence Award'", type: "positive" },
                  { insight: "Lab TAT is trending better (3.5hrs vs 4hr target). Revenue could grow 15% by adding evening sample collection", type: "opportunity" },
                  { insight: "Reception check-in time improved by 20% after new token system. Replicate at City Center branch.", type: "positive" },
                  { insight: "Pharmacy cost savings from generic substitution at 18% (target 15%) — estimated ₹45,000/month saved for patients", type: "positive" },
                  { insight: "Predicted: Next month's OPD load will increase 20% (monsoon season pattern). Recommend additional evening slots.", type: "predictive" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${item.type === "positive" ? "bg-green-50 border-green-200" : item.type === "action" ? "bg-amber-50 border-amber-200" : item.type === "opportunity" ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200"}`}>
                    <div className="flex items-start gap-2">
                      {item.type === "positive" ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /> :
                       item.type === "action" ? <Target className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /> :
                       item.type === "opportunity" ? <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /> :
                       <Zap className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />}
                      <p className="text-sm">{item.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsGamificationKpi;
