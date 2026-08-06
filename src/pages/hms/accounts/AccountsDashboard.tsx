import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IndianRupee, TrendingUp, TrendingDown, Users, ReceiptText, Wallet,
  ArrowUpRight, ArrowDownRight, Target, Brain, Sparkles, Calendar,
  Building2, PiggyBank, CreditCard, ShoppingCart, Pill
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from "recharts";

const COLORS = ["#f97316", "#10b981", "#6366f1", "#ec4899", "#eab308", "#06b6d4"];

const revenueData = [
  { month: "Jan", revenue: 485000, expense: 320000, profit: 165000 },
  { month: "Feb", revenue: 520000, expense: 310000, profit: 210000 },
  { month: "Mar", revenue: 610000, expense: 340000, profit: 270000 },
  { month: "Apr", revenue: 575000, expense: 355000, profit: 220000 },
  { month: "May", revenue: 690000, expense: 380000, profit: 310000 },
  { month: "Jun", revenue: 725000, expense: 395000, profit: 330000 },
  { month: "Jul", revenue: 680000, expense: 370000, profit: 310000 },
];

const revenueBreakdown = [
  { name: "Consultation (OPD)", value: 285000 },
  { name: "Pharmacy (OTC)", value: 195000 },
  { name: "Prescription Sales", value: 125000 },
  { name: "Lab & Diagnostics", value: 95000 },
  { name: "Panchakarma", value: 145000 },
  { name: "IPD & Procedures", value: 85000 },
];

const paymentModes = [
  { name: "Cash", value: 320000 },
  { name: "GPay/UPI", value: 245000 },
  { name: "Net Banking", value: 85000 },
  { name: "Card", value: 65000 },
  { name: "Insurance", value: 45000 },
];

const aiInsights = [
  { type: "alert", text: "₹12,500 GPay payment from yesterday not yet reconciled. Verify with bank.", priority: "high" },
  { type: "opportunity", text: "OTC sales up 23% this week. Consider increasing popular item stock.", priority: "medium" },
  { type: "target", text: "Branch Kadayanallur at 78% of monthly target. 8 days remaining.", priority: "medium" },
  { type: "saving", text: "₹8,200 in variable expenses can be optimized by consolidating vendor orders.", priority: "low" },
  { type: "followup", text: "15 patients have pending dues > 30 days. Auto-reminders scheduled.", priority: "high" },
];

const AccountsDashboard = () => {
  const [period, setPeriod] = useState("this-month");

  return (
    <div className="space-y-6">
      {/* Header with AI Insights */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Accounts Overview
          </h2>
          <p className="text-sm text-muted-foreground">Real-time financial intelligence for your clinic</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-primary">AI Financial Insights</p>
              <div className="space-y-1.5">
                {aiInsights.slice(0, 3).map((insight, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "default" : "secondary"} className="text-[10px] px-1.5">
                      {insight.priority}
                    </Badge>
                    <span className="text-foreground/80">{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </div>
            <p className="font-display text-2xl font-bold text-green-600">₹6,80,000</p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" /> +12.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <Wallet className="h-4 w-4 text-red-500" />
            </div>
            <p className="font-display text-2xl font-bold text-red-600">₹3,70,000</p>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <ArrowDownRight className="h-3 w-3" /> -2.3% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Net Profit</p>
              <PiggyBank className="h-4 w-4 text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-primary">₹3,10,000</p>
            <div className="flex items-center gap-1 text-xs text-primary">
              <ArrowUpRight className="h-3 w-3" /> +28.4% margin
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pending Dues</p>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-display text-2xl font-bold text-amber-600">₹68,500</p>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              42 patients · 8 suppliers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-3 text-center">
            <ReceiptText className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Quick Bill</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-3 text-center">
            <ShoppingCart className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <p className="text-xs font-medium">OTC Sale</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-3 text-center">
            <Pill className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-medium">Rx Sale</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-3 text-center">
            <Wallet className="h-6 w-6 mx-auto mb-1 text-red-600" />
            <p className="text-xs font-medium">Add Expense</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-3 text-center">
            <Target className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <p className="text-xs font-medium">Targets</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-3 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-1 text-amber-600" />
            <p className="text-xs font-medium">Reconcile</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue vs Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef444420" name="Expense" />
                <Area type="monotone" dataKey="profit" stroke="#6366f1" fill="#6366f120" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Breakdown by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={revenueBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}>
                  {revenueBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modes and Today's Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Mode Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentModes.map((mode) => {
                const total = paymentModes.reduce((s, m) => s + m.value, 0);
                const pct = ((mode.value / total) * 100).toFixed(1);
                return (
                  <div key={mode.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{mode.name}</span>
                      <span className="font-medium">₹{mode.value.toLocaleString("en-IN")} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">OP Bills</span>
                  <span className="font-semibold text-green-600">₹18,500 (12)</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Pharmacy (OTC)</span>
                  <span className="font-semibold text-green-600">₹8,700 (23)</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Pharmacy (Rx)</span>
                  <span className="font-semibold text-green-600">₹12,300 (8)</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Lab Tests</span>
                  <span className="font-semibold text-green-600">₹6,200 (5)</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Panchakarma</span>
                  <span className="font-semibold text-green-600">₹15,000 (3)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Cash In</span>
                  <span className="font-semibold text-green-600">₹32,400</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">UPI/GPay In</span>
                  <span className="font-semibold text-green-600">₹22,300</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Expenses (Today)</span>
                  <span className="font-semibold text-red-600">-₹8,500</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Due Collected</span>
                  <span className="font-semibold text-blue-600">₹5,800</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1">
                  <span>Net Cash Flow</span>
                  <span className="text-green-600">₹52,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountsDashboard;
