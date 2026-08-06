import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BarChart3, Users, Target, Brain, Star, TrendingUp, Calendar } from "lucide-react";

const weeklyData = [
  { date: "Mon 14/07", op: 32, opt: 8, ip: 2, revenue: 48500, rating: 4.9 },
  { date: "Tue 15/07", op: 28, opt: 5, ip: 1, revenue: 35200, rating: 4.7 },
  { date: "Wed 16/07", op: 35, opt: 12, ip: 3, revenue: 62000, rating: 4.8 },
  { date: "Thu 17/07", op: 30, opt: 7, ip: 2, revenue: 41000, rating: 4.9 },
  { date: "Fri 18/07", op: 26, opt: 6, ip: 1, revenue: 32500, rating: 4.6 },
  { date: "Sat 19/07", op: 38, opt: 14, ip: 4, revenue: 72000, rating: 4.8 },
  { date: "Sun 20/07", op: 15, opt: 3, ip: 0, revenue: 18000, rating: 5.0 },
];

const DoctorKpi = () => {
  const totalOp = weeklyData.reduce((s, d) => s + d.op, 0);
  const monthOp = 542;
  const targetOp = 600;
  const monthPct = Math.round((monthOp / targetOp) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-orange-600" /> My KPI & Performance</h1>
          <p className="text-muted-foreground">Dr. Mohamad Saleem MD (AYURVEDA) — Kadayanallur Branch</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-300">This Month: April 2026</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">28</p><p className="text-xs text-muted-foreground">OP Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{totalOp}</p><p className="text-xs text-muted-foreground">This Week</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Target className="h-5 w-5 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1">{monthOp}/{targetOp}</p><p className="text-xs text-muted-foreground">Month (Target)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{monthPct}%</p><p className="text-xs text-muted-foreground">Achievement</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Star className="h-5 w-5 mx-auto text-amber-500" /><p className="text-xl font-bold mt-1">4.8/5</p><p className="text-xs text-muted-foreground">Satisfaction</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Target vs Achievement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "OP Consultations", target: 600, actual: 542, unit: "patients" },
            { label: "OP Treatments (OPT)", target: 128, actual: 83, unit: "procedures" },
            { label: "IP Revenue", target: 900000, actual: 462850, unit: "₹" },
            { label: "Revenue Total", target: 500000, actual: 420000, unit: "₹" },
          ].map(m => {
            const pct = Math.round((m.actual / m.target) * 100);
            return (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{m.label}</span><span className={`font-bold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{m.unit === "₹" ? `₹${(m.actual/1000).toFixed(0)}K / ₹${(m.target/1000).toFixed(0)}K` : `${m.actual} / ${m.target}`} ({pct}%)</span></div>
                <Progress value={pct} className={`h-2 ${pct >= 80 ? "[&>div]:bg-green-500" : pct >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"}`} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Daily Consultation Log (This Week)</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-center">OP</th><th className="px-3 py-2 text-center">OPT</th><th className="px-3 py-2 text-center">IP</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-center">Rating</th>
            </tr></thead>
            <tbody>{weeklyData.map(d => (
              <tr key={d.date} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{d.date}</td>
                <td className="px-3 py-2 text-center">{d.op}</td>
                <td className="px-3 py-2 text-center">{d.opt}</td>
                <td className="px-3 py-2 text-center">{d.ip}</td>
                <td className="px-3 py-2 text-right">₹{d.revenue.toLocaleString()}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-amber-600">{d.rating}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div></CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Coaching</p>
            <p className="text-sm text-purple-700 mt-1">You're at 90% of OP target. Consider: extend evening hours on Tue/Thu to add 3 more patients/day. Your OPT conversion is 18% — above branch average of 12%. Panchakarma referrals strong on Saturdays — maintain that pattern.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorKpi;
