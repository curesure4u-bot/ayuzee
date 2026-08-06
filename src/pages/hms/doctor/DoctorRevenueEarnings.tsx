import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, IndianRupee, Calendar, Download } from "lucide-react";
import { toast } from "sonner";

const kpis = [
  { label: "Today", amount: "₹4,250", change: "+12%", color: "text-green-600" },
  { label: "This Week", amount: "₹28,750", change: "+8%", color: "text-green-600" },
  { label: "This Month", amount: "₹1,12,500", change: "+15%", color: "text-green-600" },
  { label: "Year-to-Date", amount: "₹9,45,000", change: "+22%", color: "text-green-600" },
];

const breakdown = [
  { source: "Consultation Fees", amount: "₹62,500", percent: 55 },
  { source: "Lab Commission (8%)", amount: "₹12,400", percent: 11 },
  { source: "Pharmacy Commission (5%)", amount: "₹8,200", percent: 7 },
  { source: "Panchakarma Referral (10%)", amount: "₹18,900", percent: 17 },
  { source: "Performance Incentive", amount: "₹10,500", percent: 10 },
];

const dailyTrend = [
  { day: "Mon", earned: 4200, target: 5000 },
  { day: "Tue", earned: 5100, target: 5000 },
  { day: "Wed", earned: 3800, target: 5000 },
  { day: "Thu", earned: 6200, target: 5000 },
  { day: "Fri", earned: 4900, target: 5000 },
  { day: "Sat", earned: 5550, target: 5000 },
];

const payoutHistory = [
  { id: "PAY-2024-012", date: "2024-01-01", amount: "₹1,05,000", status: "Paid", method: "Bank Transfer" },
  { id: "PAY-2023-012", date: "2023-12-01", amount: "₹98,500", status: "Paid", method: "Bank Transfer" },
  { id: "PAY-2023-011", date: "2023-11-01", amount: "₹1,02,300", status: "Paid", method: "Bank Transfer" },
  { id: "PAY-2023-010", date: "2023-10-01", amount: "₹87,600", status: "Paid", method: "Bank Transfer" },
  { id: "PAY-2023-009", date: "2023-09-01", amount: "₹92,100", status: "Paid", method: "Bank Transfer" },
];

export default function DoctorRevenueEarnings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue & Earnings</h1>
          <p className="text-muted-foreground">Track your income, commissions, and payouts</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.success("Report downloaded.")}><Download className="h-4 w-4" />Export</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k.label}</span>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mt-1">{k.amount}</p>
              <span className={`text-xs ${k.color} flex items-center gap-1`}><TrendingUp className="h-3 w-3" />{k.change} vs last period</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Earnings Breakdown</TabsTrigger>
          <TabsTrigger value="daily">Daily Trend</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader><CardTitle>Monthly Breakdown (This Month)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {breakdown.map((b) => (
                <div key={b.source} className="flex items-center gap-4">
                  <span className="w-48 text-sm">{b.source}</span>
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div className="bg-primary rounded-full h-3" style={{ width: `${b.percent}%` }} />
                  </div>
                  <span className="text-sm font-medium w-20 text-right">{b.amount}</span>
                  <Badge variant="outline">{b.percent}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader><CardTitle>Daily Earnings vs Target (₹5,000/day)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyTrend.map((d) => (
                  <div key={d.day} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">{d.day}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 relative">
                      <div className={`rounded-full h-4 ${d.earned >= d.target ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${(d.earned / 7000) * 100}%` }} />
                      <div className="absolute top-0 left-[71%] w-0.5 h-4 bg-red-400" title="Target" />
                    </div>
                    <span className="text-sm w-16 text-right">₹{d.earned.toLocaleString()}</span>
                    {d.earned >= d.target ? <Badge className="bg-green-100 text-green-700">✓</Badge> : <Badge variant="outline">Below</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2">ID</th><th className="text-left py-2">Date</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Method</th><th className="text-left py-2">Status</th></tr></thead>
                  <tbody>
                    {payoutHistory.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">{p.id}</td>
                        <td className="py-2">{p.date}</td>
                        <td className="py-2 font-medium">{p.amount}</td>
                        <td className="py-2">{p.method}</td>
                        <td className="py-2"><Badge className="bg-green-100 text-green-700">{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
