import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IndianRupee, Download, Printer, FileSpreadsheet, Brain, Sparkles,
  TrendingUp, Users, Building2, CreditCard, Wallet
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#f97316", "#10b981", "#6366f1", "#ec4899", "#eab308", "#06b6d4", "#8b5cf6"];

const dailySummaryData = [
  { user: "Dr. Sivarama Krishnan", cash: 8500, card: 2000, cheque: 0, dd: 0, neft: 0, credit: 3500, gpay: 5000, total: 19000 },
  { user: "Kumar (Cashier)", cash: 12000, card: 1500, cheque: 0, dd: 0, neft: 0, credit: 2000, gpay: 8200, total: 23700 },
  { user: "Priya (Pharmacy)", cash: 5200, card: 800, cheque: 0, dd: 0, neft: 0, credit: 1500, gpay: 3800, total: 11300 },
  { user: "Anitha (Lab)", cash: 2800, card: 0, cheque: 0, dd: 0, neft: 1200, credit: 0, gpay: 2700, total: 6700 },
];

const netCollectionByUser = [
  { user: "sankari", cash: 0, card: 0, cheque: 0, dd: 0, neft: 0, credit: 0, gpay: 5000, total: 14500 },
];

const collectionByDept = [
  { dept: "OPD Consultation", amount: 28500, pct: 42 },
  { dept: "Pharmacy", amount: 18500, pct: 27 },
  { dept: "Lab & Diagnostics", amount: 9800, pct: 14 },
  { dept: "Panchakarma", amount: 8200, pct: 12 },
  { dept: "IP & Procedures", amount: 3500, pct: 5 },
];

const incomeByPaymentType = [
  { name: "Cash", value: 28500 },
  { name: "GPay/UPI", value: 19700 },
  { name: "Credit", value: 7000 },
  { name: "Card", value: 4300 },
  { name: "NEFT", value: 1200 },
];

const hourlyCollection = [
  { hour: "9AM", amount: 8500 },
  { hour: "10AM", amount: 12200 },
  { hour: "11AM", amount: 9800 },
  { hour: "12PM", amount: 7500 },
  { hour: "1PM", amount: 3200 },
  { hour: "2PM", amount: 5800 },
  { hour: "3PM", amount: 8900 },
  { hour: "4PM", amount: 4800 },
];

const collectionReports = [
  "Daily Summary", "My Daily Summary", "My Net Collection", "My Transaction",
  "My Consolidated Income", "My Income - Billwise", "My Income By Dept",
  "My Income By Dept - Visitwise", "My Income - As Consultant", "My Income - As Referral"
];

const MisCollection = () => {
  const [activeReport, setActiveReport] = useState("daily-summary");
  const grandTotal = dailySummaryData.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-4 mt-4">
      {/* Report Buttons */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Collection Reports</p>
          <div className="flex flex-wrap gap-2">
            {collectionReports.map((r) => (
              <Button key={r} size="sm" variant={activeReport === r.toLowerCase().replace(/ /g, "-") ? "default" : "outline"} 
                className="text-xs h-7" onClick={() => setActiveReport(r.toLowerCase().replace(/ /g, "-"))}>
                {r}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI: </span>
              Collection is 18% above daily average. GPay collections up 35% this week. 
              Kumar has highest cash collection. Consider shifting more patients to digital for faster reconciliation.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Daily Summary</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export As CSV
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export As Excel
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-red-50 text-red-700 border-red-200">
            <Printer className="mr-1 h-3 w-3" /> Print
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            <Printer className="mr-1 h-3 w-3" /> Dot Matrix Print
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-xs text-primary">S.No</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-primary">User</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">Cash</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">Card</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">Cheque</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">DD</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">Neft</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">Credit</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">GooglePay</th>
                  <th className="px-3 py-2 text-right font-medium text-xs text-primary">Total</th>
                </tr>
              </thead>
              <tbody>
                {dailySummaryData.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{i + 1}</td>
                    <td className="px-3 py-2 text-xs font-medium">{row.user}</td>
                    <td className="px-3 py-2 text-xs text-right">{row.cash.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right">{row.card.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right">{row.cheque.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right">{row.dd.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right">{row.neft.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right">{row.credit.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right text-green-600">{row.gpay.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-right font-bold text-primary">{row.total.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-muted/50 font-bold">
                  <td className="px-3 py-2 text-xs" colSpan={2}>Total</td>
                  <td className="px-3 py-2 text-xs text-right">{dailySummaryData.reduce((s, r) => s + r.cash, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right">{dailySummaryData.reduce((s, r) => s + r.card, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right">{dailySummaryData.reduce((s, r) => s + r.cheque, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right">{dailySummaryData.reduce((s, r) => s + r.dd, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right">{dailySummaryData.reduce((s, r) => s + r.neft, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right">{dailySummaryData.reduce((s, r) => s + r.credit, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right text-green-600">{dailySummaryData.reduce((s, r) => s + r.gpay, 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-right font-bold text-primary">{grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Collection by Payment Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={incomeByPaymentType} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {incomeByPaymentType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Hourly Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyCollection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Collection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Collection by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {collectionByDept.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium min-w-[140px]">{d.dept}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/80 rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-xs font-semibold min-w-[80px] text-right">₹{d.amount.toLocaleString("en-IN")}</span>
                <Badge variant="outline" className="text-[10px]">{d.pct}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MisCollection;
