import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, Calendar, CreditCard, PieChart } from "lucide-react";

const kpis = [
  { label: "Today", value: "₹12,500", trend: "+8%", icon: IndianRupee },
  { label: "This Week", value: "₹68,000", trend: "+12%", icon: TrendingUp },
  { label: "This Month", value: "₹2,85,000", trend: "+5%", icon: Calendar },
];

const breakdown = [
  { category: "Consultation Fees", percentage: 45, amount: "₹1,28,250", color: "bg-blue-500" },
  { category: "Lab Commission", percentage: 20, amount: "₹57,000", color: "bg-green-500" },
  { category: "PK Referral", percentage: 18, amount: "₹51,300", color: "bg-purple-500" },
  { category: "Pharmacy", percentage: 12, amount: "₹34,200", color: "bg-orange-500" },
  { category: "Incentive Bonus", percentage: 5, amount: "₹14,250", color: "bg-pink-500" },
];

const dailyData = [
  { day: "Mon", amount: 11200, height: "70%" },
  { day: "Tue", amount: 13500, height: "84%" },
  { day: "Wed", amount: 9800, height: "61%" },
  { day: "Thu", amount: 14200, height: "89%" },
  { day: "Fri", amount: 12500, height: "78%" },
  { day: "Sat", amount: 6800, height: "42%" },
];

const payoutHistory = [
  { date: "01 Jun 2025", amount: "₹2,72,000", status: "Paid", method: "Bank Transfer" },
  { date: "01 May 2025", amount: "₹2,58,000", status: "Paid", method: "Bank Transfer" },
  { date: "01 Apr 2025", amount: "₹2,91,000", status: "Paid", method: "Bank Transfer" },
  { date: "01 Mar 2025", amount: "₹2,45,000", status: "Paid", method: "Bank Transfer" },
];

const DoctorRevenue = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6" /> Revenue Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <Badge variant="secondary" className="mt-1 text-green-600">{kpi.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PieChart className="h-5 w-5" /> Revenue Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="text-muted-foreground">{item.amount} ({item.percentage}%)</span>
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
              {dailyData.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-muted-foreground">₹{(d.amount / 1000).toFixed(1)}k</span>
                  <div className="w-full bg-primary/80 rounded-t" style={{ height: d.height }} />
                  <span className="text-xs font-medium">{d.day}</span>
                </div>
              ))}
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
                {payoutHistory.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2">{row.date}</td>
                    <td className="py-2 font-medium">{row.amount}</td>
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
