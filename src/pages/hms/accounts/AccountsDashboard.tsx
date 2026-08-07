import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IndianRupee, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Brain, Sparkles,
  Building2, PiggyBank, CreditCard, ShoppingCart, Pill, ReceiptText,
  Target, Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAccountsDashboard } from "@/hooks/useAccountsDashboard";

const COLORS = ["#f97316", "#10b981", "#6366f1", "#ec4899", "#eab308", "#06b6d4"];

const AccountsDashboard = () => {
  const [period, setPeriod] = useState("this-month");
  const { kpis, monthlyTrend, revenueSources, paymentModes, aiInsights, loading, error } = useAccountsDashboard(period);

  const kpiIcons = [IndianRupee, Wallet, PiggyBank, CreditCard];
  const kpiColors = ["text-green-600", "text-red-600", "text-primary", "text-amber-600"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Accounts Overview
          </h2>
          <p className="text-sm text-muted-foreground">Real-time financial intelligence for your clinic</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading financial data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

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
        {kpis.map((kpi, idx) => {
          const Icon = kpiIcons[idx] || IndianRupee;
          const color = kpiColors[idx] || "text-green-600";
          return (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className={`font-display text-2xl font-bold ${color}`}>{kpi.formatted}</p>
                {kpi.change !== 0 && (
                  <div className={`flex items-center gap-1 text-xs ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {kpi.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(kpi.change)}% {kpi.label === "Net Profit" ? "margin" : "from last period"}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { icon: ReceiptText, label: "Quick Bill", color: "text-primary" },
          { icon: ShoppingCart, label: "OTC Sale", color: "text-green-600" },
          { icon: Pill, label: "Rx Sale", color: "text-blue-600" },
          { icon: Wallet, label: "Add Expense", color: "text-red-600" },
          { icon: Target, label: "Targets", color: "text-purple-600" },
          { icon: Building2, label: "Reconcile", color: "text-amber-600" },
        ].map((action) => (
          <Card key={action.label} className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-3 text-center">
              <action.icon className={`h-6 w-6 mx-auto mb-1 ${action.color}`} />
              <p className="text-xs font-medium">{action.label}</p>
            </CardContent>
          </Card>
        ))}
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
              <AreaChart data={monthlyTrend}>
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
                <Pie data={revenueSources} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percentage }) => `${name.split(" ")[0]} ${percentage}%`}>
                  {revenueSources.map((_, i) => (
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

      {/* Payment Modes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Payment Mode Split</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paymentModes.map((mode) => (
              <div key={mode.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{mode.name}</span>
                  <span className="font-medium">₹{mode.value.toLocaleString("en-IN")} ({mode.percentage}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${mode.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsDashboard;
