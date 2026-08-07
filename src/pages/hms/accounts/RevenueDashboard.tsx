import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee, TrendingUp, TrendingDown, Users, Calendar,
  CreditCard, Wallet, BarChart3, ArrowUpRight, ArrowDownRight,
  Building2, Stethoscope, FlaskConical, Pill, Download, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RevenueDashboard = () => {
  const [period, setPeriod] = useState("this-month");
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ total: 0, pharmacy: 0, advances: 0, wastage: 0, patientsBilled: 0 });
  const [byStore, setByStore] = useState<{ store: string; amount: number }[]>([]);

  useEffect(() => { loadRevenue(); }, []);

  const loadRevenue = async () => {
    setLoading(true);
    try {
      const [{ data: sales }, { data: advances }, { data: wastage }] = await Promise.all([
        (supabase as any).from("hms_ward_consumption_log").select("bill_amount, ward_store_id, hms_ward_stores(ward_name)").eq("billed_to_patient", true),
        (supabase as any).from("hms_patient_advances").select("amount, payment_mode"),
        (supabase as any).from("hms_ward_consumption_log").select("bill_amount").in("consumption_type", ["wastage", "expired"]),
      ]);

      const pharmacyTotal = (sales || []).reduce((s: number, r: any) => s + (r.bill_amount || 0), 0);
      const advanceTotal = (advances || []).reduce((s: number, a: any) => s + (a.amount || 0), 0);
      const wastageTotal = (wastage || []).reduce((s: number, w: any) => s + (w.bill_amount || 0), 0);

      setRevenue({
        total: pharmacyTotal + advanceTotal,
        pharmacy: pharmacyTotal,
        advances: advanceTotal,
        wastage: wastageTotal,
        patientsBilled: (sales || []).length,
      });

      // Group by store
      const storeMap: Record<string, number> = {};
      (sales || []).forEach((s: any) => {
        const name = s.hms_ward_stores?.ward_name || "Unknown";
        storeMap[name] = (storeMap[name] || 0) + (s.bill_amount || 0);
      });
      setByStore(Object.entries(storeMap).map(([store, amount]) => ({ store, amount })).sort((a, b) => b.amount - a.amount));
    } catch (err: any) {
      toast.error("Failed to load revenue");
      console.error(err);
    }
    setLoading(false);
  };

  const kpis = [
    { label: "Total Revenue", value: "₹12,45,000", change: 14.2, trend: "up", icon: IndianRupee, color: "text-green-600" },
    { label: "Total Collection", value: "₹11,08,500", change: 11.8, trend: "up", icon: Wallet, color: "text-blue-600" },
    { label: "Outstanding", value: "₹1,36,500", change: -5.2, trend: "down", icon: CreditCard, color: "text-red-600" },
    { label: "Expenses", value: "₹4,85,000", change: 3.1, trend: "up", icon: TrendingDown, color: "text-orange-600" },
    { label: "Net Profit", value: "₹6,23,500", change: 18.5, trend: "up", icon: TrendingUp, color: "text-emerald-600" },
    { label: "Patients Billed", value: "1,680", change: 8.4, trend: "up", icon: Users, color: "text-purple-600" },
  ];

  const departmentRevenue = [
    { dept: "OPD Consultation", revenue: 385000, percent: 31, icon: Stethoscope, color: "bg-blue-500" },
    { dept: "Lab & Diagnostics", revenue: 345000, percent: 28, icon: FlaskConical, color: "bg-green-500" },
    { dept: "Pharmacy", revenue: 265000, percent: 21, icon: Pill, color: "bg-purple-500" },
    { dept: "Panchakarma & Therapies", revenue: 155000, percent: 12, icon: Building2, color: "bg-amber-500" },
    { dept: "Radiology", revenue: 95000, percent: 8, icon: BarChart3, color: "bg-red-500" },
  ];

  const collectionByMode = [
    { mode: "UPI", amount: 425000, percent: 38, color: "bg-purple-500" },
    { mode: "Cash", amount: 312000, percent: 28, color: "bg-green-500" },
    { mode: "Card", amount: 178000, percent: 16, color: "bg-blue-500" },
    { mode: "Insurance/TPA", amount: 135000, percent: 12, color: "bg-amber-500" },
    { mode: "Online Transfer", amount: 58500, percent: 6, color: "bg-red-500" },
  ];

  const dailyTrend = [
    { day: "Mon", amount: 185000 }, { day: "Tue", amount: 210000 }, { day: "Wed", amount: 178000 },
    { day: "Thu", amount: 225000 }, { day: "Fri", amount: 195000 }, { day: "Sat", amount: 252000 },
  ];

  const topDoctors = [
    { name: "Dr. Mohamad Saleem", revenue: 420000, patients: 285 },
    { name: "Dr. Anitha Kumari", revenue: 285000, patients: 180 },
    { name: "Dr. Ramesh Babu", revenue: 195000, patients: 120 },
    { name: "Dr. Priya Nair", revenue: 145000, patients: 95 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Revenue Dashboard</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="this-week">This Week</SelectItem><SelectItem value="this-month">This Month</SelectItem><SelectItem value="last-month">Last Month</SelectItem><SelectItem value="quarter">Quarter</SelectItem><SelectItem value="year">This Year</SelectItem></SelectContent></Select>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1"><kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} /><span className="text-[10px] text-muted-foreground">{kpi.label}</span></div>
              <p className="text-lg font-bold">{kpi.value}</p>
              <p className={`text-[10px] font-medium flex items-center gap-0.5 ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {kpi.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(kpi.change)}% vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Department Revenue */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Department</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {departmentRevenue.map((dept) => (
              <div key={dept.dept} className="flex items-center gap-3">
                <dept.icon className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1"><span>{dept.dept}</span><span className="font-bold">₹{(dept.revenue / 1000).toFixed(0)}K</span></div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${dept.color}`} style={{ width: `${dept.percent}%` }} /></div>
                </div>
                <span className="text-[10px] text-muted-foreground w-8">{dept.percent}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Collection by Mode */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Collection by Payment Mode</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {collectionByMode.map((mode) => (
              <div key={mode.mode} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${mode.color} shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1"><span>{mode.mode}</span><span className="font-bold">₹{(mode.amount / 1000).toFixed(0)}K</span></div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${mode.color}`} style={{ width: `${mode.percent * 2}%` }} /></div>
                </div>
                <span className="text-[10px] text-muted-foreground w-8">{mode.percent}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Revenue Trend (This Week)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-[120px]">
              {dailyTrend.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-green-500 rounded-t" style={{ height: `${(day.amount / 260000) * 100}%` }} />
                  <span className="text-[9px] text-muted-foreground">{day.day}</span>
                  <span className="text-[9px] font-medium">₹{(day.amount / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Doctors */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Revenue Generators</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topDoctors.map((doc, i) => (
              <div key={doc.name} className="flex items-center gap-3 text-xs">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[10px]">{i + 1}</span>
                <div className="flex-1"><p className="font-medium">{doc.name}</p><p className="text-[10px] text-muted-foreground">{doc.patients} patients</p></div>
                <span className="font-bold text-green-600">₹{(doc.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueDashboard;
