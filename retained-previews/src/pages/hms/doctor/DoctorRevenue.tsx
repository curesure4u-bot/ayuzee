import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, Calendar, CreditCard, PieChart, Loader2 } from "lucide-react";
import { useDoctorRevenue } from "@/hooks/useDoctorRevenue";

const DoctorRevenue = () => {
  const { kpis, breakdown, dailyEarnings, payoutHistory, loading, error } = useDoctorRevenue();

  const kpiIcons = [IndianRupee, TrendingUp, Calendar];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6" /> Revenue Dashboard</h1>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading revenue data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing cached/demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpiIcons[idx] || IndianRupee;
          return (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.formatted}</div>
                {kpi.trend && <Badge variant="secondary" className="mt-1 text-green-600">{kpi.trend}</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PieChart className="h-5 w-5" /> Revenue Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="text-muted-foreground">{item.formatted} ({item.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Daily Earnings (This Week)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {dailyEarnings.map((d) => {
                const maxAmount = Math.max(...dailyEarnings.map((e) => e.amount), 1);
                const heightPct = Math.round((d.amount / maxAmount) * 100);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs text-muted-foreground">₹{(d.amount / 1000).toFixed(1)}k</span>
                    <div className="w-full bg-primary/80 rounded-t" style={{ height: `${heightPct}%` }} />
                    <span className="text-xs font-medium">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-5 w-5" /> Payout History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Date</th><th className="pb-2">Amount</th><th className="pb-2">Method</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {payoutHistory.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2">{row.date}</td>
                    <td className="py-2 font-medium">{row.formatted}</td>
                    <td className="py-2 text-muted-foreground">{row.method}</td>
                    <td className="py-2"><Badge variant="secondary" className="text-green-600">{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRevenue;
