import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, TrendingDown, IndianRupee, Users,
  Calendar, Clock, Activity, Brain, ArrowUp, ArrowDown,
  PieChart, LineChart, Target, Zap, Download, Filter,
} from "lucide-react";

type RevenueData = { month: string; opd: number; ipd: number; pharmacy: number; lab: number; panchakarma: number; total: number };
type DepartmentPerf = { name: string; patients: number; revenue: number; satisfaction: number; growth: number; occupancy?: number };
type PatientFlow = { hour: string; newPatients: number; returnPatients: number; total: number };
type AiPrediction = { metric: string; current: string; predicted: string; confidence: number; trend: "up" | "down" | "flat"; insight: string };

const revenueData: RevenueData[] = [
  { month: "Jan", opd: 820000, ipd: 450000, pharmacy: 380000, lab: 180000, panchakarma: 620000, total: 2450000 },
  { month: "Feb", opd: 780000, ipd: 520000, pharmacy: 350000, lab: 195000, panchakarma: 580000, total: 2425000 },
  { month: "Mar", opd: 920000, ipd: 480000, pharmacy: 420000, lab: 210000, panchakarma: 700000, total: 2730000 },
  { month: "Apr", opd: 850000, ipd: 550000, pharmacy: 390000, lab: 220000, panchakarma: 680000, total: 2690000 },
  { month: "May", opd: 980000, ipd: 600000, pharmacy: 450000, lab: 240000, panchakarma: 750000, total: 3020000 },
  { month: "Jun", opd: 1050000, ipd: 580000, pharmacy: 480000, lab: 260000, panchakarma: 820000, total: 3190000 },
  { month: "Jul*", opd: 1120000, ipd: 620000, pharmacy: 510000, lab: 275000, panchakarma: 880000, total: 3405000 },
];

const departmentPerf: DepartmentPerf[] = [
  { name: "Ayurveda OPD", patients: 2850, revenue: 1050000, satisfaction: 4.8, growth: 12 },
  { name: "Panchakarma", patients: 480, revenue: 880000, satisfaction: 4.9, growth: 18, occupancy: 85 },
  { name: "Homeopathy", patients: 920, revenue: 320000, satisfaction: 4.6, growth: 8 },
  { name: "Pharmacy", patients: 3200, revenue: 510000, satisfaction: 4.5, growth: 15 },
  { name: "Lab & Diagnostics", patients: 1450, revenue: 275000, satisfaction: 4.7, growth: 22 },
  { name: "IPD (In-Patient)", patients: 85, revenue: 620000, satisfaction: 4.8, growth: 10, occupancy: 72 },
  { name: "Teleconsult", patients: 380, revenue: 190000, satisfaction: 4.4, growth: 35 },
  { name: "Siddha", patients: 220, revenue: 98000, satisfaction: 4.7, growth: 5 },
];

const patientFlow: PatientFlow[] = [
  { hour: "8 AM", newPatients: 5, returnPatients: 8, total: 13 },
  { hour: "9 AM", newPatients: 12, returnPatients: 18, total: 30 },
  { hour: "10 AM", newPatients: 15, returnPatients: 22, total: 37 },
  { hour: "11 AM", newPatients: 10, returnPatients: 20, total: 30 },
  { hour: "12 PM", newPatients: 8, returnPatients: 12, total: 20 },
  { hour: "1 PM", newPatients: 3, returnPatients: 5, total: 8 },
  { hour: "2 PM", newPatients: 6, returnPatients: 10, total: 16 },
  { hour: "3 PM", newPatients: 8, returnPatients: 15, total: 23 },
  { hour: "4 PM", newPatients: 10, returnPatients: 18, total: 28 },
  { hour: "5 PM", newPatients: 7, returnPatients: 12, total: 19 },
  { hour: "6 PM", newPatients: 4, returnPatients: 8, total: 12 },
  { hour: "7 PM", newPatients: 2, returnPatients: 4, total: 6 },
];

const aiPredictions: AiPrediction[] = [
  { metric: "Next Month Revenue", current: "₹34.05L", predicted: "₹38.2L", confidence: 82, trend: "up", insight: "Monsoon season + Panchakarma demand surge expected. Historical pattern shows 12% increase in Jul-Aug." },
  { metric: "OPD Footfall (Next Week)", current: "~180/day", predicted: "~210/day", confidence: 78, trend: "up", insight: "Post-weekend pattern + 3 follow-up batches due. Consider opening extra evening slots." },
  { metric: "Pharmacy Revenue", current: "₹5.1L", predicted: "₹5.8L", confidence: 75, trend: "up", insight: "New Panchakarma IP batch starting (15 patients) will drive kashayam/tailam consumption." },
  { metric: "No-Show Rate", current: "12%", predicted: "8%", confidence: 70, trend: "down", insight: "WhatsApp reminder automation reduced no-shows by 4% last month. Trend continuing." },
  { metric: "Bed Occupancy (IPD)", current: "72%", predicted: "85%", confidence: 80, trend: "up", insight: "5 new Panchakarma admissions confirmed. Peak occupancy expected Thu-Sat." },
  { metric: "Patient Satisfaction", current: "4.7/5", predicted: "4.8/5", confidence: 65, trend: "up", insight: "New feedback collection via WhatsApp capturing more positive responses. Bias-check recommended." },
];

const topDiseases = [
  { condition: "Sandhivata (Osteoarthritis)", patients: 320, pct: 18, trend: "up" },
  { condition: "Amavata (Rheumatoid Arthritis)", patients: 185, pct: 10, trend: "up" },
  { condition: "Gridhrasi (Sciatica)", patients: 165, pct: 9, trend: "flat" },
  { condition: "Pandu (Anemia)", patients: 140, pct: 8, trend: "down" },
  { condition: "Madhumeha (Diabetes)", patients: 135, pct: 7, trend: "up" },
  { condition: "Shwasa (Asthma/COPD)", patients: 120, pct: 7, trend: "flat" },
  { condition: "Twak Vikara (Skin Diseases)", patients: 110, pct: 6, trend: "up" },
  { condition: "Arsha (Piles/Hemorrhoids)", patients: 95, pct: 5, trend: "flat" },
];

const HmsDataAnalytics = () => {
  const [period, setPeriod] = useState("this-month");
  const currentMonthRev = revenueData[revenueData.length - 1];
  const prevMonthRev = revenueData[revenueData.length - 2];
  const revenueGrowth = Math.round(((currentMonthRev.total - prevMonthRev.total) / prevMonthRev.total) * 100);

  const totalPatients = departmentPerf.reduce((s, d) => s + d.patients, 0);
  const peakHour = patientFlow.reduce((max, h) => h.total > max.total ? h : max, patientFlow[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" /> Data Analytics & Business Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time insights · Revenue analytics · Patient flow · Department performance · AI forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => toast.success("Report exported as PDF")}>
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-lg font-bold mt-1">₹{(currentMonthRev.total / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">Revenue (Jul)</p>
            <Badge variant="outline" className="text-[9px] text-green-600 mt-1">
              <ArrowUp className="h-2 w-2 mr-0.5" /> {revenueGrowth}% vs Jun
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-lg font-bold mt-1">{totalPatients.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Patients</p>
            <Badge variant="outline" className="text-[9px] text-green-600 mt-1">
              <ArrowUp className="h-2 w-2 mr-0.5" /> 14% growth
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-lg font-bold mt-1">{peakHour.hour}</p>
            <p className="text-xs text-muted-foreground">Peak Hour ({peakHour.total} pts)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Activity className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-lg font-bold mt-1">4.7/5</p>
            <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-5 w-5 mx-auto text-orange-600" />
            <p className="text-lg font-bold mt-1">87%</p>
            <p className="text-xs text-muted-foreground">Target Achievement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="patients">Patient Flow</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="diseases">Disease Analytics</TabsTrigger>
          <TabsTrigger value="ai-forecast">AI Forecast</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Revenue Trend (2026)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {revenueData.map((r) => (
                  <div key={r.month} className="flex items-center gap-3">
                    <span className="text-xs w-8 text-muted-foreground">{r.month}</span>
                    <div className="flex-1 flex gap-0.5 h-6 rounded overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(r.opd / r.total) * 100}%` }} title={`OPD: ₹${(r.opd/100000).toFixed(1)}L`} />
                      <div className="bg-blue-500 h-full" style={{ width: `${(r.ipd / r.total) * 100}%` }} title={`IPD: ₹${(r.ipd/100000).toFixed(1)}L`} />
                      <div className="bg-amber-500 h-full" style={{ width: `${(r.pharmacy / r.total) * 100}%` }} title={`Pharmacy: ₹${(r.pharmacy/100000).toFixed(1)}L`} />
                      <div className="bg-purple-500 h-full" style={{ width: `${(r.lab / r.total) * 100}%` }} title={`Lab: ₹${(r.lab/100000).toFixed(1)}L`} />
                      <div className="bg-orange-500 h-full" style={{ width: `${(r.panchakarma / r.total) * 100}%` }} title={`PK: ₹${(r.panchakarma/100000).toFixed(1)}L`} />
                    </div>
                    <span className="text-xs font-bold w-16 text-right">₹{(r.total / 100000).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t">
                {[
                  { label: "OPD", color: "bg-emerald-500" },
                  { label: "IPD", color: "bg-blue-500" },
                  { label: "Pharmacy", color: "bg-amber-500" },
                  { label: "Lab", color: "bg-purple-500" },
                  { label: "Panchakarma", color: "bg-orange-500" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`h-3 w-3 rounded ${l.color}`} />
                    <span className="text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Split — This Month</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { dept: "OPD Consultations", amount: currentMonthRev.opd, pct: Math.round((currentMonthRev.opd / currentMonthRev.total) * 100) },
                    { dept: "Panchakarma Packages", amount: currentMonthRev.panchakarma, pct: Math.round((currentMonthRev.panchakarma / currentMonthRev.total) * 100) },
                    { dept: "IPD (In-Patient)", amount: currentMonthRev.ipd, pct: Math.round((currentMonthRev.ipd / currentMonthRev.total) * 100) },
                    { dept: "Pharmacy Sales", amount: currentMonthRev.pharmacy, pct: Math.round((currentMonthRev.pharmacy / currentMonthRev.total) * 100) },
                    { dept: "Lab & Diagnostics", amount: currentMonthRev.lab, pct: Math.round((currentMonthRev.lab / currentMonthRev.total) * 100) },
                  ].map(d => (
                    <div key={d.dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{d.dept}</span>
                        <span className="font-bold">₹{(d.amount / 100000).toFixed(1)}L ({d.pct}%)</span>
                      </div>
                      <Progress value={d.pct} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Revenue KPIs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { kpi: "Revenue per Patient", value: "₹1,850", change: "+8%", good: true },
                    { kpi: "Revenue per Doctor", value: "₹6.8L", change: "+12%", good: true },
                    { kpi: "Collection Efficiency", value: "94%", change: "+2%", good: true },
                    { kpi: "Outstanding Dues", value: "₹2.1L", change: "-15%", good: true },
                    { kpi: "Insurance Claim Pending", value: "₹3.8L", change: "+5%", good: false },
                    { kpi: "Avg. Billing per Visit", value: "₹2,400", change: "+10%", good: true },
                  ].map(k => (
                    <div key={k.kpi} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{k.kpi}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{k.value}</span>
                        <Badge variant="outline" className={`text-[10px] ${k.good ? "text-green-600" : "text-red-600"}`}>
                          {k.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patient Flow Tab */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Hourly Patient Flow — Today</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {patientFlow.map((h) => (
                  <div key={h.hour} className="flex items-center gap-3">
                    <span className="text-xs w-12 text-muted-foreground">{h.hour}</span>
                    <div className="flex-1 flex gap-0.5 h-5 rounded overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-l" style={{ width: `${(h.newPatients / 40) * 100}%` }} />
                      <div className="bg-emerald-400 h-full rounded-r" style={{ width: `${(h.returnPatients / 40) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-right">{h.total}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 mt-3 pt-2 border-t">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-blue-500" /><span className="text-xs">New Patients</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-emerald-400" /><span className="text-xs">Return Patients</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">New vs Return Ratio</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">32% : 68%</p>
                  <p className="text-xs text-muted-foreground mt-1">New : Return patients</p>
                  <p className="text-xs text-green-600 mt-2">Good retention rate indicates patient satisfaction</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Avg. Wait Time</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">14 min</p>
                  <p className="text-xs text-muted-foreground mt-1">Average across all departments</p>
                  <Badge variant="outline" className="text-[10px] text-green-600 mt-2"><ArrowDown className="h-2 w-2 mr-0.5" /> 3 min vs last month</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">No-Show Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">8.5%</p>
                  <p className="text-xs text-muted-foreground mt-1">Down from 12% (pre-WhatsApp reminders)</p>
                  <Badge variant="outline" className="text-[10px] text-green-600 mt-2"><ArrowDown className="h-2 w-2 mr-0.5" /> -3.5%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Department Performance Tab */}
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Department Performance Comparison</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">Department</th>
                    <th className="px-3 py-2 text-left font-medium">Patients</th>
                    <th className="px-3 py-2 text-left font-medium">Revenue</th>
                    <th className="px-3 py-2 text-left font-medium">Satisfaction</th>
                    <th className="px-3 py-2 text-left font-medium">Growth</th>
                    <th className="px-3 py-2 text-left font-medium">Occupancy</th>
                  </tr></thead>
                  <tbody>
                    {departmentPerf.map((d) => (
                      <tr key={d.name} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{d.name}</td>
                        <td className="px-3 py-2">{d.patients.toLocaleString()}</td>
                        <td className="px-3 py-2 font-bold">₹{(d.revenue / 100000).toFixed(1)}L</td>
                        <td className="px-3 py-2">
                          <span className={`font-bold ${d.satisfaction >= 4.7 ? "text-green-600" : d.satisfaction >= 4.5 ? "text-amber-600" : "text-red-600"}`}>
                            {d.satisfaction}/5
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] ${d.growth >= 15 ? "text-green-600" : d.growth >= 10 ? "text-blue-600" : "text-muted-foreground"}`}>
                            {d.growth > 0 ? <ArrowUp className="h-2 w-2 mr-0.5 inline" /> : null}
                            {d.growth}%
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          {d.occupancy ? (
                            <div className="flex items-center gap-2">
                              <Progress value={d.occupancy} className="h-2 w-16" />
                              <span className="text-xs">{d.occupancy}%</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">N/A</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disease Analytics Tab */}
        <TabsContent value="diseases" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Top Conditions Treated — This Month</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDiseases.map((d, idx) => (
                  <div key={d.condition} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-muted-foreground">#{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{d.condition}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{d.patients} patients ({d.pct}%)</span>
                          {d.trend === "up" ? <ArrowUp className="h-3 w-3 text-green-600" /> :
                           d.trend === "down" ? <ArrowDown className="h-3 w-3 text-red-600" /> :
                           <span className="text-[10px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                      <Progress value={d.pct * 5} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-3 flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">AI Disease Pattern Insight</p>
                <p className="text-blue-600 mt-0.5">
                  Musculoskeletal conditions (Sandhivata, Amavata, Gridhrasi) account for 37% of all cases.
                  Consider expanding Panchakarma room capacity for Janu Basti and Kati Basti. 
                  Seasonal prediction: Respiratory conditions (Shwasa) expected to rise 25% in Aug-Sep monsoon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Forecast Tab */}
        <TabsContent value="ai-forecast" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" /> AI-Powered Predictions & Forecasting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiPredictions.map((pred) => (
                  <div key={pred.metric} className="p-4 rounded-lg border hover:shadow-sm transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{pred.metric}</p>
                        {pred.trend === "up" ? <ArrowUp className="h-4 w-4 text-green-600" /> :
                         pred.trend === "down" ? <ArrowDown className="h-4 w-4 text-red-600" /> :
                         <span className="text-muted-foreground">→</span>}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Confidence: {pred.confidence}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-sm font-bold">{pred.current}</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Predicted (Next Month)</p>
                        <p className="text-sm font-bold text-purple-600">{pred.predicted}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{pred.insight}</p>
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

export default HmsDataAnalytics;
