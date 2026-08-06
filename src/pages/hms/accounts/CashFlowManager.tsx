import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight,
  Wallet, PiggyBank, Building2, Calendar, Brain, Sparkles, BarChart3,
  Clock, AlertTriangle
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

const dailyCashFlow = [
  { date: "Jul 16", inflow: 52000, outflow: 28000, net: 24000 },
  { date: "Jul 17", inflow: 58000, outflow: 35000, net: 23000 },
  { date: "Jul 18", inflow: 48000, outflow: 22000, net: 26000 },
  { date: "Jul 19", inflow: 65000, outflow: 42000, net: 23000 },
  { date: "Jul 20", inflow: 55000, outflow: 30000, net: 25000 },
  { date: "Jul 21", inflow: 72000, outflow: 38000, net: 34000 },
  { date: "Jul 22", inflow: 60700, outflow: 25000, net: 35700 },
];

const monthlyCashFlow = [
  { month: "Jan", inflow: 485000, outflow: 420000, net: 65000 },
  { month: "Feb", inflow: 520000, outflow: 395000, net: 125000 },
  { month: "Mar", inflow: 610000, outflow: 480000, net: 130000 },
  { month: "Apr", inflow: 575000, outflow: 510000, net: 65000 },
  { month: "May", inflow: 690000, outflow: 520000, net: 170000 },
  { month: "Jun", inflow: 725000, outflow: 545000, net: 180000 },
  { month: "Jul", inflow: 680000, outflow: 495000, net: 185000 },
];

const cashPositions = [
  { account: "Main Current A/C (SBI)", balance: 485000, type: "bank" },
  { account: "Savings A/C (HDFC)", balance: 320000, type: "bank" },
  { account: "Cash in Hand (Drawer)", balance: 18200, type: "cash" },
  { account: "Petty Cash", balance: 3800, type: "cash" },
  { account: "Fixed Deposit (SBI)", balance: 500000, type: "fd" },
  { account: "Digital Wallet (GPay Business)", balance: 12500, type: "digital" },
];

const upcomingInflows = [
  { source: "Due Collections (15 patients)", amount: 68500, expectedDate: "This week", probability: 65 },
  { source: "Insurance Claims (3 pending)", amount: 45000, expectedDate: "Jul 28-30", probability: 80 },
  { source: "Franchise Payment (Salem)", amount: 45000, expectedDate: "Jul 25", probability: 90 },
  { source: "Franchise Payment (Trichy)", amount: 25000, expectedDate: "Jul 28", probability: 85 },
  { source: "Lab camp revenue (scheduled)", amount: 35000, expectedDate: "Jul 26", probability: 70 },
];

const upcomingOutflows = [
  { purpose: "Staff Salaries (Aug 1)", amount: 250000, dueDate: "Aug 01", priority: "critical" },
  { purpose: "Kottakkal Supplier Payment", amount: 95000, dueDate: "Jul 25", priority: "high" },
  { purpose: "Rent + Utilities", amount: 33500, dueDate: "Aug 01", priority: "critical" },
  { purpose: "MedLab (Overdue)", amount: 28000, dueDate: "OVERDUE", priority: "critical" },
  { purpose: "Medicine restock (Himalaya)", amount: 55000, dueDate: "Aug 05", priority: "medium" },
  { purpose: "Loan EMI", amount: 35000, dueDate: "Aug 05", priority: "critical" },
];

const CashFlowManager = () => {
  const [view, setView] = useState("daily");

  const totalBankBalance = cashPositions.filter(c => c.type === "bank").reduce((s, c) => s + c.balance, 0);
  const totalCashInHand = cashPositions.filter(c => c.type === "cash").reduce((s, c) => s + c.balance, 0);
  const totalLiquid = cashPositions.filter(c => c.type !== "fd").reduce((s, c) => s + c.balance, 0);
  const totalExpectedInflow = upcomingInflows.reduce((s, i) => s + i.amount, 0);
  const totalExpectedOutflow = upcomingOutflows.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Cash Flow Management
          </h2>
          <p className="text-sm text-muted-foreground">Real-time cash position, forecasting & AI-driven suggestions</p>
        </div>
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily View</SelectItem>
            <SelectItem value="monthly">Monthly View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cash Position Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Bank Balance</p>
            </div>
            <p className="font-display text-xl font-bold text-green-600">₹{totalBankBalance.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">2 accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Cash in Hand</p>
            </div>
            <p className="font-display text-xl font-bold text-amber-600">₹{totalCashInHand.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">Drawer + Petty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Expected Inflow</p>
            </div>
            <p className="font-display text-xl font-bold text-blue-600">₹{totalExpectedInflow.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">Next 10 days</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Expected Outflow</p>
            </div>
            <p className="font-display text-xl font-bold text-red-600">₹{totalExpectedOutflow.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">Next 15 days</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Forecast */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">AI Cash Flow Forecast</p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                <p>• Current liquid position: ₹{totalLiquid.toLocaleString("en-IN")} - sufficient for next 15 days operations</p>
                <p>• Salary (₹2.5L) + Rent (₹33.5K) due Aug 1. Ensure ₹2.84L available by Jul 30.</p>
                <p>• If franchise payments (₹70K expected) arrive on time, you can clear all overdue suppliers this week.</p>
                <p>• Recommendation: Pay MedLab overdue (₹28K) today to maintain good credit terms.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {view === "daily" ? "Daily" : "Monthly"} Cash Flow Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={view === "daily" ? dailyCashFlow : monthlyCashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={view === "daily" ? "date" : "month"} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Legend />
              <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="#10b98120" name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="#ef444420" name="Outflow" />
              <Area type="monotone" dataKey="net" stroke="#6366f1" fill="#6366f120" name="Net Cash Flow" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Inflows and Outflows */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expected Inflows */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" /> Expected Inflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingInflows.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{item.source}</p>
                    <p className="text-xs text-muted-foreground">{item.expectedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{item.amount.toLocaleString("en-IN")}</p>
                    <Badge variant="outline" className="text-[10px]">{item.probability}% likely</Badge>
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-2 font-semibold border-t">
                <span>Total Expected</span>
                <span className="text-green-600">₹{totalExpectedInflow.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Outflows */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" /> Upcoming Outflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingOutflows.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded border ${item.priority === "critical" ? "border-red-200 bg-red-50/30" : ""}`}>
                  <div>
                    <p className="font-medium text-sm">{item.purpose}</p>
                    <p className="text-xs text-muted-foreground">{item.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">₹{item.amount.toLocaleString("en-IN")}</p>
                    <Badge className={
                      item.priority === "critical" ? "bg-red-100 text-red-700" :
                      item.priority === "high" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    } >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-2 font-semibold border-t">
                <span>Total Expected</span>
                <span className="text-red-600">₹{totalExpectedOutflow.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Balances */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Account-wise Cash Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cashPositions.map((acc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center gap-2">
                  {acc.type === "bank" && <Building2 className="h-4 w-4 text-blue-500" />}
                  {acc.type === "cash" && <Wallet className="h-4 w-4 text-green-500" />}
                  {acc.type === "fd" && <PiggyBank className="h-4 w-4 text-purple-500" />}
                  {acc.type === "digital" && <IndianRupee className="h-4 w-4 text-amber-500" />}
                  <div>
                    <p className="font-medium text-xs">{acc.account}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{acc.type}</p>
                  </div>
                </div>
                <p className="font-semibold">₹{acc.balance.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between p-3 rounded bg-primary/5 font-semibold">
            <span>Total Liquid Assets</span>
            <span className="text-primary">₹{totalLiquid.toLocaleString("en-IN")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowManager;
