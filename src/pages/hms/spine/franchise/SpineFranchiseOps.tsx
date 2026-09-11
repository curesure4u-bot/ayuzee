import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, TrendingUp, TrendingDown, Users, IndianRupee, Building2,
  Star, Target, Activity, Award, MapPin, ArrowUpRight, ArrowDownRight,
  Calendar, Percent, Store, Wifi, Layers, Crown,
} from "lucide-react";

// ─── Mock franchise center data (would come from DB in production) ───
interface CenterData {
  id: string;
  name: string;
  city: string;
  model: string;
  patients: number;
  revenue: number;
  packages: number;
  satisfaction: number;
  conversionRate: number;
  avgPainReduction: number;
  monthlyGrowth: number;
  status: string;
}

const fallbackCenters: CenterData[] = [
  { id: "c1", name: "Ayuzee Kadayanallur", city: "Kadayanallur", model: "physical", patients: 124, revenue: 892000, packages: 45, satisfaction: 4.8, conversionRate: 68, avgPainReduction: 72, monthlyGrowth: 12, status: "excellent" },
  { id: "c2", name: "Ayuzee Tirunelveli", city: "Tirunelveli", model: "physical", patients: 89, revenue: 534000, packages: 32, satisfaction: 4.7, conversionRate: 62, avgPainReduction: 68, monthlyGrowth: 8, status: "good" },
  { id: "c3", name: "Ayuzee Chennai", city: "Chennai", model: "hybrid", patients: 156, revenue: 1024000, packages: 58, satisfaction: 4.9, conversionRate: 71, avgPainReduction: 74, monthlyGrowth: 18, status: "excellent" },
  { id: "c4", name: "Ayuzee Rajapalayam", city: "Rajapalayam", model: "physical", patients: 71, revenue: 426000, packages: 28, satisfaction: 4.6, conversionRate: 58, avgPainReduction: 65, monthlyGrowth: 5, status: "good" },
  { id: "c5", name: "Ayuzee Online (Pan-India)", city: "Online", model: "online", patients: 210, revenue: 630000, packages: 82, satisfaction: 4.5, conversionRate: 45, avgPainReduction: 60, monthlyGrowth: 25, status: "growing" },
  { id: "c6", name: "Ayuzee Theni", city: "Theni", model: "hybrid", patients: 43, revenue: 258000, packages: 18, satisfaction: 4.5, conversionRate: 55, avgPainReduction: 63, monthlyGrowth: 3, status: "needs-attention" },
];

const growthStatus = (growth: number): string =>
  growth >= 15 ? "growing" : growth >= 10 ? "excellent" : growth >= 6 ? "good" : "needs-attention";

const modelIcon: Record<string, any> = { physical: Store, online: Wifi, hybrid: Layers };
const statusColor: Record<string, string> = {
  excellent: "bg-green-100 text-green-700",
  good: "bg-blue-100 text-blue-700",
  growing: "bg-purple-100 text-purple-700",
  "needs-attention": "bg-amber-100 text-amber-700",
};

export default function SpineFranchiseOps() {
  const [modelFilter, setModelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const [centers, setCenters] = useState<CenterData[]>(fallbackCenters);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data } = await supabase.from("spine_franchise_data").select("*").eq("record_type", "center").eq("is_active", true);
        if (data && data.length > 0) {
          setCenters(data.map((c: any) => ({
            id: c.id,
            name: c.center_name,
            city: c.city,
            model: c.model,
            patients: c.patients || 0,
            revenue: c.revenue || 0,
            packages: c.packages || 0,
            satisfaction: Number(c.satisfaction) || 0,
            conversionRate: c.conversion_rate || 0,
            avgPainReduction: (c.metadata && c.metadata.avgPainReduction) || 65,
            monthlyGrowth: c.monthly_growth || 0,
            status: growthStatus(c.monthly_growth || 0),
          })));
        }
      } catch (err) { /* keep fallback */ }
    };
    fetchCenters();
  }, []);

  const filtered = useMemo(() => {
    let list = modelFilter === "all" ? [...centers] : centers.filter(c => c.model === modelFilter);
    list.sort((a, b) => {
      switch (sortBy) {
        case "revenue": return b.revenue - a.revenue;
        case "patients": return b.patients - a.patients;
        case "satisfaction": return b.satisfaction - a.satisfaction;
        case "growth": return b.monthlyGrowth - a.monthlyGrowth;
        default: return 0;
      }
    });
    return list;
  }, [modelFilter, sortBy, centers]);

  // Aggregate KPIs
  const totals = useMemo(() => {
    const list = modelFilter === "all" ? centers : centers.filter(c => c.model === modelFilter);
    if (list.length === 0) return { centers: 0, patients: 0, revenue: 0, packages: 0, avgSatisfaction: "0", avgConversion: 0, avgPainReduction: 0, avgGrowth: 0 };
    return {
      centers: list.length,
      patients: list.reduce((s, c) => s + c.patients, 0),
      revenue: list.reduce((s, c) => s + c.revenue, 0),
      packages: list.reduce((s, c) => s + c.packages, 0),
      avgSatisfaction: (list.reduce((s, c) => s + c.satisfaction, 0) / list.length).toFixed(1),
      avgConversion: Math.round(list.reduce((s, c) => s + c.conversionRate, 0) / list.length),
      avgPainReduction: Math.round(list.reduce((s, c) => s + c.avgPainReduction, 0) / list.length),
      avgGrowth: Math.round(list.reduce((s, c) => s + c.monthlyGrowth, 0) / list.length),
    };
  }, [modelFilter, centers]);

  const maxRevenue = Math.max(...filtered.map(c => c.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Franchise Operations Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Multi-center performance — KPIs, revenue, patient flow across all Spine AYUSH centers
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          <Building2 className="h-3 w-3 mr-1" /> Franchise Tool #3
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          {["all", "physical", "online", "hybrid"].map(m => (
            <Button key={m} variant={modelFilter === m ? "default" : "outline"} size="sm" onClick={() => setModelFilter(m)} className="text-xs capitalize">{m === "all" ? "All Models" : m}</Button>
          ))}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Sort: Revenue</SelectItem>
            <SelectItem value="patients">Sort: Patients</SelectItem>
            <SelectItem value="satisfaction">Sort: Satisfaction</SelectItem>
            <SelectItem value="growth">Sort: Growth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <Card><CardContent className="pt-3 pb-2 text-center"><Building2 className="h-4 w-4 mx-auto text-purple-500" /><p className="text-lg font-bold mt-1">{totals.centers}</p><p className="text-[9px] text-muted-foreground">Centers</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Users className="h-4 w-4 mx-auto text-blue-500" /><p className="text-lg font-bold mt-1">{totals.patients}</p><p className="text-[9px] text-muted-foreground">Total Patients</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-500" /><p className="text-sm font-bold mt-1">₹{(totals.revenue / 100000).toFixed(1)}L</p><p className="text-[9px] text-muted-foreground">Total Revenue</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Award className="h-4 w-4 mx-auto text-amber-500" /><p className="text-lg font-bold mt-1">{totals.packages}</p><p className="text-[9px] text-muted-foreground">Packages Sold</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Star className="h-4 w-4 mx-auto text-yellow-500" /><p className="text-lg font-bold mt-1">{totals.avgSatisfaction}</p><p className="text-[9px] text-muted-foreground">Avg Rating</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Percent className="h-4 w-4 mx-auto text-cyan-500" /><p className="text-lg font-bold mt-1">{totals.avgConversion}%</p><p className="text-[9px] text-muted-foreground">Conversion</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Activity className="h-4 w-4 mx-auto text-red-500" /><p className="text-lg font-bold mt-1">{totals.avgPainReduction}%</p><p className="text-[9px] text-muted-foreground">Pain Reduction</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><TrendingUp className="h-4 w-4 mx-auto text-emerald-500" /><p className="text-lg font-bold mt-1 text-emerald-600">+{totals.avgGrowth}%</p><p className="text-[9px] text-muted-foreground">Avg Growth</p></CardContent></Card>
      </div>

      {/* Revenue Comparison Bar Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><IndianRupee className="h-4 w-4" /> Revenue by Center</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {filtered.map(c => {
            const Icon = modelIcon[c.model];
            return (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-[10px] w-[130px] truncate flex items-center gap-1"><Icon className="h-3 w-3" /> {c.name}</span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded flex items-center justify-end pr-1" style={{ width: `${(c.revenue / maxRevenue) * 100}%` }}>
                    <span className="text-[9px] text-white font-bold">₹{(c.revenue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Center Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => {
          const Icon = modelIcon[c.model];
          return (
            <Card key={c.id} className="hover:shadow-md transition">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1"><Icon className="h-4 w-4" /> {c.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {c.city}</p>
                  </div>
                  <Badge className={`${statusColor[c.status]} text-[8px]`}>{c.status.replace("-", " ")}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-1.5 bg-blue-50 rounded"><span className="text-muted-foreground">Patients</span><p className="font-bold">{c.patients}</p></div>
                  <div className="p-1.5 bg-green-50 rounded"><span className="text-muted-foreground">Revenue</span><p className="font-bold">₹{(c.revenue / 100000).toFixed(1)}L</p></div>
                  <div className="p-1.5 bg-amber-50 rounded"><span className="text-muted-foreground">Packages</span><p className="font-bold">{c.packages}</p></div>
                  <div className="p-1.5 bg-purple-50 rounded"><span className="text-muted-foreground">Rating</span><p className="font-bold">{c.satisfaction} ⭐</p></div>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">{c.conversionRate}%</span>
                  </div>
                  <Progress value={c.conversionRate} className="h-1.5" />
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-muted-foreground">Pain Reduction</span>
                    <span className="font-medium">{c.avgPainReduction}%</span>
                  </div>
                  <Progress value={c.avgPainReduction} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-muted-foreground">Monthly Growth</span>
                  <span className={`font-bold flex items-center gap-0.5 ${c.monthlyGrowth >= 10 ? "text-green-600" : c.monthlyGrowth >= 5 ? "text-blue-600" : "text-amber-600"}`}>
                    {c.monthlyGrowth >= 5 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    +{c.monthlyGrowth}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Crown className="h-4 w-4 text-amber-500" /> Performance Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Center</th>
                  <th className="text-center p-2">Patients</th>
                  <th className="text-center p-2">Revenue</th>
                  <th className="text-center p-2">Rating</th>
                  <th className="text-center p-2">Conversion</th>
                  <th className="text-center p-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a, b) => b.revenue - a.revenue).map((c, i) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-bold">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                    <td className="p-2 font-medium">{c.name}</td>
                    <td className="p-2 text-center">{c.patients}</td>
                    <td className="p-2 text-center font-medium">₹{(c.revenue / 100000).toFixed(1)}L</td>
                    <td className="p-2 text-center">{c.satisfaction} ⭐</td>
                    <td className="p-2 text-center">{c.conversionRate}%</td>
                    <td className="p-2 text-center text-emerald-600 font-medium">+{c.monthlyGrowth}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Target className="h-4 w-4 text-purple-600" /> Network Insights</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-1.5"><TrendingUp className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /><span><strong>Online center</strong> has highest growth (+25%) and patient volume — scale digital reach.</span></div>
            <div className="flex items-start gap-1.5"><Star className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" /><span><strong>Chennai (Hybrid)</strong> is top performer — replicate its model in new cities.</span></div>
            <div className="flex items-start gap-1.5"><Target className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" /><span><strong>Theni</strong> needs attention — low conversion (55%). Review sales training + marketing.</span></div>
            <div className="flex items-start gap-1.5"><Layers className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" /><span><strong>Hybrid model</strong> shows best balance of revenue + satisfaction. Recommend for new franchisees.</span></div>
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center">Demo data shown. Connect franchise centers to HMS to see live metrics from each location.</p>
    </div>
  );
}
