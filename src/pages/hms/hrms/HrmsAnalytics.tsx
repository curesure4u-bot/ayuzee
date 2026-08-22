import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, TrendingDown, Building2, IndianRupee, UserCheck, Clock } from "lucide-react";

const workforceMetrics = { totalActive: 24, avgTenureDays: 580, avgSalary: 48200, totalPayroll: 1157000, maleCount: 14, femaleCount: 10, permanentCount: 18, contractCount: 3, probationCount: 3, attritionRate: 4.2, newJoiners90d: 3 };

const departmentData = [
  { name: "Panchakarma", employees: 6, payroll: 189000, attendance: 94 },
  { name: "Ayurveda", employees: 4, payroll: 290000, attendance: 97 },
  { name: "Front Office", employees: 3, payroll: 70000, attendance: 92 },
  { name: "Pharmacy", employees: 3, payroll: 98000, attendance: 100 },
  { name: "Administration", employees: 3, payroll: 135000, attendance: 96 },
  { name: "IPD / Nursing", employees: 2, payroll: 70000, attendance: 88 },
  { name: "Laboratory", employees: 2, payroll: 60000, attendance: 95 },
  { name: "Housekeeping", employees: 1, payroll: 15000, attendance: 100 },
];

const branchData = [
  { name: "Main Hospital — Kadayanallur", code: "ALSH-01", staff: 20, attendance: 94, payroll: 950000 },
  { name: "Branch 2", code: "ALSH-02", staff: 4, attendance: 90, payroll: 120000 },
];

const tenureBands = [
  { band: "< 6 months", count: 3, pct: 12.5 },
  { band: "6-12 months", count: 4, pct: 16.7 },
  { band: "1-2 years", count: 8, pct: 33.3 },
  { band: "2-3 years", count: 5, pct: 20.8 },
  { band: "3+ years", count: 4, pct: 16.7 },
];

const attritionTrend = [
  { month: "Mar", exits: 0 }, { month: "Apr", exits: 1 }, { month: "May", exits: 0 },
  { month: "Jun", exits: 1 }, { month: "Jul", exits: 0 }, { month: "Aug", exits: 0 },
];

const HrmsAnalytics = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-indigo-600" /> Workforce Analytics</h1>
      <p className="text-sm text-muted-foreground">Branch comparisons, trends & HR intelligence</p>
    </div>

    {/* Key Metrics */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="border-blue-100"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{workforceMetrics.totalActive}</p><p className="text-[9px] text-muted-foreground">Active</p></CardContent></Card>
      <Card className="border-green-100"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-700">₹{(workforceMetrics.totalPayroll / 100000).toFixed(1)}L</p><p className="text-[9px] text-muted-foreground">Payroll</p></CardContent></Card>
      <Card className="border-purple-100"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1 text-purple-700">{Math.round(workforceMetrics.avgTenureDays / 30)}m</p><p className="text-[9px] text-muted-foreground">Avg Tenure</p></CardContent></Card>
      <Card className="border-amber-100"><CardContent className="p-3 text-center"><TrendingDown className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-700">{workforceMetrics.attritionRate}%</p><p className="text-[9px] text-muted-foreground">Attrition</p></CardContent></Card>
      <Card className="border-cyan-100"><CardContent className="p-3 text-center"><UserCheck className="h-4 w-4 mx-auto text-cyan-600" /><p className="text-xl font-bold mt-1">{workforceMetrics.newJoiners90d}</p><p className="text-[9px] text-muted-foreground">Joiners (90d)</p></CardContent></Card>
      <Card className="border-indigo-100"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-indigo-600" /><p className="text-xl font-bold mt-1">₹{(workforceMetrics.avgSalary / 1000).toFixed(0)}K</p><p className="text-[9px] text-muted-foreground">Avg Salary</p></CardContent></Card>
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      {/* Gender & Employment Type */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Gender & Employment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1"><div className="flex justify-between text-xs mb-1"><span>Male</span><span className="font-bold">{workforceMetrics.maleCount} ({Math.round(workforceMetrics.maleCount / workforceMetrics.totalActive * 100)}%)</span></div><Progress value={workforceMetrics.maleCount / workforceMetrics.totalActive * 100} className="h-3" /></div>
            <div className="flex-1"><div className="flex justify-between text-xs mb-1"><span>Female</span><span className="font-bold">{workforceMetrics.femaleCount} ({Math.round(workforceMetrics.femaleCount / workforceMetrics.totalActive * 100)}%)</span></div><Progress value={workforceMetrics.femaleCount / workforceMetrics.totalActive * 100} className="h-3" /></div>
          </div>
          <div className="flex gap-2 text-xs"><Badge variant="outline">Permanent: {workforceMetrics.permanentCount}</Badge><Badge variant="outline">Contract: {workforceMetrics.contractCount}</Badge><Badge variant="outline">Probation: {workforceMetrics.probationCount}</Badge></div>
        </CardContent>
      </Card>

      {/* Tenure */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Tenure Distribution</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {tenureBands.map((b) => (<div key={b.band} className="flex items-center gap-3"><span className="text-xs w-24">{b.band}</span><Progress value={b.pct} className="flex-1 h-2" /><span className="text-xs font-medium w-6 text-right">{b.count}</span></div>))}
        </CardContent>
      </Card>

      {/* Department Comparison */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Department Comparison</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b bg-muted/40"><tr><th className="px-3 py-2 text-left font-medium">Department</th><th className="px-3 py-2 text-center font-medium">Staff</th><th className="px-3 py-2 text-right font-medium">Payroll</th><th className="px-3 py-2 text-center font-medium">Attendance</th><th className="px-3 py-2 text-center font-medium">Share</th></tr></thead><tbody>
          {departmentData.map((d) => (<tr key={d.name} className="border-b hover:bg-muted/20"><td className="px-3 py-2 font-medium">{d.name}</td><td className="px-3 py-2 text-center">{d.employees}</td><td className="px-3 py-2 text-right">₹{(d.payroll / 1000).toFixed(0)}K</td><td className="px-3 py-2 text-center"><span className={`font-medium ${d.attendance >= 95 ? "text-green-700" : d.attendance >= 90 ? "text-amber-700" : "text-red-600"}`}>{d.attendance}%</span></td><td className="px-3 py-2"><Progress value={d.employees / workforceMetrics.totalActive * 100} className="h-1.5" /></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>

      {/* Branch */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Branch Comparison</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {branchData.map((b) => (<div key={b.code} className="p-3 border rounded-lg"><div className="flex items-center justify-between"><div><p className="text-xs font-medium">{b.name}</p><p className="text-[9px] text-muted-foreground">{b.code}</p></div><Badge variant="outline" className="text-[9px]">{b.staff} staff</Badge></div><div className="grid grid-cols-3 gap-2 mt-2 text-center"><div><p className="text-xs font-bold text-green-700">{b.attendance}%</p><p className="text-[8px] text-muted-foreground">Attendance</p></div><div><p className="text-xs font-bold">₹{(b.payroll / 1000).toFixed(0)}K</p><p className="text-[8px] text-muted-foreground">Payroll</p></div><div><p className="text-xs font-bold">₹{Math.round(b.payroll / b.staff / 1000)}K</p><p className="text-[8px] text-muted-foreground">Avg/Head</p></div></div></div>))}
        </CardContent>
      </Card>

      {/* Attrition Trend */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Attrition Trend (6 months)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-20">
            {attritionTrend.map((m) => (<div key={m.month} className="flex-1 flex flex-col items-center gap-1"><div className={`w-full rounded-t ${m.exits > 0 ? "bg-red-400" : "bg-gray-200"}`} style={{ height: `${Math.max(10, m.exits * 50)}%` }} /><span className="text-[9px] text-muted-foreground">{m.month}</span><span className="text-[10px] font-medium">{m.exits}</span></div>))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Total exits: {attritionTrend.reduce((s, m) => s + m.exits, 0)} &middot; Rate: {workforceMetrics.attritionRate}%</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default HrmsAnalytics;
