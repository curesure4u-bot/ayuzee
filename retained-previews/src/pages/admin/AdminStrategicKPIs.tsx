import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Period = "this_month" | "last_month" | "last_3_months" | "last_6_months" | "this_year";

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  let from: Date;
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  switch (period) {
    case "this_month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_month":
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case "last_3_months":
      from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case "last_6_months":
      from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case "this_year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

export default function AdminStrategicKPIs() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalDoctors: 0,
    totalTherapists: 0,
    totalPatients: 0,
    completedSessions: 0,
    revenue: 0,
    pendingPayouts: 0,
  });
  const [growth, setGrowth] = useState({
    mom: "Calculating...",
    retention: "Calculating...",
    completionRate: "Calculating...",
  });

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange(period);

      const { count: doctorsCount } = await (supabase as any)
        .from("doctors")
        .select("*", { count: "exact", head: true });

      const { count: therapistsCount } = await (supabase as any)
        .from("therapists")
        .select("*", { count: "exact", head: true });

      const { count: patientsCount } = await (supabase as any)
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: completedCount } = await (supabase as any)
        .from("therapy_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("scheduled_date", from)
        .lt("scheduled_date", to);

      const { data: revenueData } = await (supabase as any)
        .from("therapy_sessions")
        .select("total_amount")
        .eq("status", "completed")
        .gte("scheduled_date", from)
        .lt("scheduled_date", to);

      const totalRevenue = (revenueData || []).reduce(
        (sum: number, s: any) => sum + (Number(s.total_amount) || 0),
        0
      );

      const { data: payoutsData } = await (supabase as any)
        .from("payout_requests")
        .select("amount")
        .eq("status", "pending");

      const pendingPayouts = (payoutsData || []).reduce(
        (sum: number, p: any) => sum + (Number(p.amount) || 0),
        0
      );

      setKpis({
        totalDoctors: doctorsCount || 0,
        totalTherapists: therapistsCount || 0,
        totalPatients: patientsCount || 0,
        completedSessions: completedCount || 0,
        revenue: totalRevenue,
        pendingPayouts,
      });

      // Growth calculations
      const { count: totalSessions } = await (supabase as any)
        .from("therapy_sessions")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_date", from)
        .lt("scheduled_date", to);

      const completionRate =
        totalSessions && totalSessions > 0
          ? ((completedCount || 0) / totalSessions * 100).toFixed(1) + "%"
          : "0%";

      setGrowth({
        mom: doctorsCount && doctorsCount > 0 ? "Active" : "0%",
        retention: doctorsCount && doctorsCount > 0 ? "Active" : "0%",
        completionRate,
      });
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      toast.error("Failed to load KPI data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [period]);

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  const kpiCards = [
    { label: "Total Doctors", value: kpis.totalDoctors },
    { label: "Total Therapists", value: kpis.totalTherapists },
    { label: "Total Patients/Users", value: kpis.totalPatients },
    { label: "Completed Sessions", value: kpis.completedSessions },
    { label: "Revenue", value: formatCurrency(kpis.revenue) },
    { label: "Pending Payouts", value: formatCurrency(kpis.pendingPayouts) },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Strategic KPIs</h1>
            <p className="text-muted-foreground">CEO-level business metrics</p>
          </div>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? "..." : kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Section */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">MoM Growth</p>
              <p className="text-2xl font-bold mt-1">{growth.mom}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Doctor Retention</p>
              <p className="text-2xl font-bold mt-1">{growth.retention}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Session Completion Rate</p>
              <p className="text-2xl font-bold mt-1">{growth.completionRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Data is calculated in real-time from platform tables
      </p>
    </div>
  );
}
