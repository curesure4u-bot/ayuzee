import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, TrendingUp, Trophy, Users, Building2, Pill, FlaskConical,
  Calendar, Star, ArrowUpRight, Brain, Sparkles, Medal
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar } from "recharts";

type TargetEntry = {
  id: string;
  category: string;
  target: number;
  achieved: number;
  unit: string;
  period: string;
  assignedTo?: string;
  branch?: string;
};

const monthlyTargets: TargetEntry[] = [
  { id: "1", category: "Total Revenue", target: 800000, achieved: 680000, unit: "₹", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "2", category: "OPD Consultations", target: 450, achieved: 380, unit: "patients", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "3", category: "Pharmacy Sales (OTC)", target: 250000, achieved: 195000, unit: "₹", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "4", category: "Prescription Sales", target: 180000, achieved: 125000, unit: "₹", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "5", category: "Lab Tests", target: 200, achieved: 165, unit: "tests", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "6", category: "Panchakarma Revenue", target: 200000, achieved: 145000, unit: "₹", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "7", category: "New Patient Registrations", target: 120, achieved: 92, unit: "patients", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "8", category: "Repeat Patient Rate", target: 60, achieved: 54, unit: "%", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "9", category: "Due Collections", target: 100000, achieved: 72000, unit: "₹", period: "Jul 2026", branch: "Kadayanallur" },
  { id: "10", category: "Referral Revenue", target: 50000, achieved: 38000, unit: "₹", period: "Jul 2026", branch: "Kadayanallur" },
];

const staffTargets = [
  { name: "Dr. Sivarama Krishnan", role: "Consultant", target: 200000, achieved: 178000, patients: 85, targetPatients: 100 },
  { name: "Priya (Pharmacist)", role: "Pharmacist", target: 150000, achieved: 132000, patients: 0, targetPatients: 0 },
  { name: "Anitha (Lab Tech)", role: "Lab Technician", target: 80000, achieved: 62000, patients: 0, targetPatients: 0 },
  { name: "Kumar (Reception)", role: "Front Desk", target: 0, achieved: 0, patients: 180, targetPatients: 200 },
  { name: "Lakshmi (Therapist)", role: "Panchakarma", target: 120000, achieved: 95000, patients: 45, targetPatients: 60 },
];

const branchComparison = [
  { branch: "Kadayanallur", target: 800000, achieved: 680000 },
  { branch: "Rajapalayam", target: 600000, achieved: 510000 },
  { branch: "Theni", target: 550000, achieved: 480000 },
  { branch: "Tirunelveli", target: 700000, achieved: 620000 },
  { branch: "Chennai", target: 1200000, achieved: 1050000 },
  { branch: "Tenkasi", target: 400000, achieved: 360000 },
];

const TargetVsAchieved = () => {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const overallTarget = monthlyTargets
    .filter(t => t.unit === "₹")
    .reduce((s, t) => s + t.target, 0);
  const overallAchieved = monthlyTargets
    .filter(t => t.unit === "₹")
    .reduce((s, t) => s + t.achieved, 0);
  const overallPct = Math.round((overallAchieved / overallTarget) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Target vs Achieved
          </h2>
          <p className="text-sm text-muted-foreground">Track performance across all departments and branches</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="kadayanallur">Kadayanallur</SelectItem>
              <SelectItem value="rajapalayam">Rajapalayam</SelectItem>
              <SelectItem value="chennai">Chennai</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <Calendar className="mr-1 h-4 w-4" /> Set Targets
          </Button>
        </div>
      </div>

      {/* Overall Performance Gauge */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                  className="text-primary" strokeDasharray={`${overallPct * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-display text-2xl font-bold text-primary">{overallPct}%</span>
                <span className="text-xs text-muted-foreground">Achieved</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">Overall Revenue Target</p>
              <p className="text-xs text-muted-foreground">₹{(overallAchieved / 100000).toFixed(1)}L / ₹{(overallTarget / 100000).toFixed(1)}L</p>
            </div>
            <Badge className={`mt-2 ${overallPct >= 80 ? "bg-green-100 text-green-700" : overallPct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
              {overallPct >= 80 ? "On Track" : overallPct >= 60 ? "Needs Attention" : "Behind Target"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Branch-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branchComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <YAxis type="category" dataKey="branch" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[0, 4, 4, 0]} />
                <Bar dataKey="achieved" fill="#f97316" name="Achieved" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Targets */}
      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="staff">By Staff</TabsTrigger>
          <TabsTrigger value="branch">By Branch</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-3 mt-4">
          {monthlyTargets.map((t) => {
            const pct = Math.round((t.achieved / t.target) * 100);
            return (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t.category}</span>
                      <Badge variant="outline" className="text-[10px]">{t.period}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {t.unit === "₹" ? `₹${t.achieved.toLocaleString("en-IN")}` : `${t.achieved} ${t.unit}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {t.unit === "₹" ? `₹${t.target.toLocaleString("en-IN")}` : `${t.target} ${t.unit}`}
                      </span>
                      <Badge className={`text-xs ${pct >= 80 ? "bg-green-100 text-green-700" : pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {pct}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <div className="space-y-3">
            {staffTargets.map((s, i) => {
              const revPct = s.target > 0 ? Math.round((s.achieved / s.target) * 100) : 0;
              const patPct = s.targetPatients > 0 ? Math.round((s.patients / s.targetPatients) * 100) : 0;
              return (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {revPct >= 90 && <Medal className="h-4 w-4 text-amber-500" />}
                        <Badge variant={revPct >= 80 ? "default" : "secondary"}>{revPct || patPct}% achieved</Badge>
                      </div>
                    </div>
                    {s.target > 0 && (
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Revenue: ₹{s.achieved.toLocaleString("en-IN")} / ₹{s.target.toLocaleString("en-IN")}</span>
                          <span>{revPct}%</span>
                        </div>
                        <Progress value={revPct} className="h-1.5" />
                      </div>
                    )}
                    {s.targetPatients > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Patients: {s.patients} / {s.targetPatients}</span>
                          <span>{patPct}%</span>
                        </div>
                        <Progress value={patPct} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="branch" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branchComparison.map((b, i) => {
              const pct = Math.round((b.achieved / b.target) * 100);
              return (
                <Card key={i} className={pct >= 85 ? "border-green-200" : pct >= 70 ? "border-amber-200" : "border-red-200"}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{b.branch}</p>
                      <Trophy className={`h-4 w-4 ${pct >= 85 ? "text-green-500" : pct >= 70 ? "text-amber-500" : "text-red-400"}`} />
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-display text-lg font-bold">{pct}%</span>
                      <span className="text-xs text-muted-foreground">
                        ₹{(b.achieved / 100000).toFixed(1)}L / ₹{(b.target / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      {pct >= 85 ? (
                        <span className="text-green-600 flex items-center gap-1"><Star className="h-3 w-3" /> Excellent</span>
                      ) : pct >= 70 ? (
                        <span className="text-amber-600">Needs push - 8 days left</span>
                      ) : (
                        <span className="text-red-600">Urgent attention needed</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Recommendations */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> AI Target Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-2 rounded bg-green-50">
              <Sparkles className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Pharmacy OTC is 22% behind target. Suggest running a weekend wellness camp to boost walk-in sales.</p>
            </div>
            <div className="flex items-start gap-2 p-2 rounded bg-blue-50">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Dr. Sivarama Krishnan is at 89% - just 22 more consultations to hit ₹2L target. Consider extending evening OPD.</p>
            </div>
            <div className="flex items-start gap-2 p-2 rounded bg-purple-50">
              <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
              <p>Due collections are only at 72%. Send WhatsApp payment reminders with QR code for quick payment.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TargetVsAchieved;
