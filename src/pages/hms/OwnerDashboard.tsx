import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  IndianRupee, Users, TrendingUp, Building2,
  Wallet, CreditCard, BarChart3, FileText,
  UserCog, Receipt, Shield, Landmark, Info,
} from "lucide-react";

const quickLinks = [
  { label: "Financial Reports", to: "/hms/reports", icon: FileText },
  { label: "MIS", to: "/hms/mis-dashboard", icon: BarChart3 },
  { label: "Staff Payroll", to: "/hms/payroll", icon: UserCog },
  { label: "Insurance Claims", to: "/hms/insurance", icon: Shield },
  { label: "Branch Performance", to: "/hms/branch-performance", icon: Building2 },
  { label: "GST Filing Status", to: "/hms/accounts-gst", icon: Receipt },
];

const OwnerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Owner / Investor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Business snapshot — {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Structure (empty) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total Revenue (Month)", icon: IndianRupee, color: "text-green-600" },
          { label: "Net Profit", icon: TrendingUp, color: "text-emerald-600" },
          { label: "Total Patients", icon: Users, color: "text-blue-600" },
          { label: "Outstanding / Receivables", icon: CreditCard, color: "text-amber-600" },
          { label: "Cash in Bank", icon: Landmark, color: "text-indigo-600" },
          { label: "Staff Cost Ratio", icon: UserCog, color: "text-purple-600" },
        ].map((k) => (
          <Card key={k.label} className="relative overflow-hidden">
            <CardContent className="pt-5 pb-4 px-4">
              <div className="flex items-center justify-between mb-2">
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <p className="text-xl font-bold text-muted-foreground">—</p>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State Notice */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="py-10 text-center space-y-4">
          <Info className="h-12 w-12 text-blue-500 mx-auto" />
          <h2 className="text-xl font-semibold">No Data Available</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            This dashboard will automatically populate with your hospital's revenue, branch performance, patient metrics, and financial data once you start entering operational data through the HMS modules.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>To get started:</p>
            <p>1. Set up your <strong>Hospital Profile</strong> and branches</p>
            <p>2. Add patients and generate bills through <strong>OPD / IPD</strong></p>
            <p>3. Data will appear here automatically based on your role</p>
          </div>
        </CardContent>
      </Card>

      {/* Branch Performance Table (empty structure) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Branch Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Branch</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Patients</th>
                  <th className="pb-2 font-medium">Avg Bill</th>
                  <th className="pb-2 font-medium">Growth</th>
                  <th className="pb-2 font-medium">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No branch data yet. Add branches in Hospital Profile to see performance here.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend (empty) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Revenue trend will appear once billing data is available.
            </div>
          </CardContent>
        </Card>

        {/* Department Revenue Split (empty) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Department Revenue Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Department-wise revenue will appear once departments are configured and billing starts.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Business Metrics (empty) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Key Business Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {["New Patient Acquisition", "Patient Retention Rate", "Avg Revenue Per Patient", "Revenue Per Doctor", "Bed Occupancy Rate", "Cost Per Patient"].map((label) => (
              <div key={label} className="text-center p-3 rounded-lg border">
                <p className="text-xl font-bold text-muted-foreground">—</p>
                <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Outstanding & Collection (empty) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Outstanding & Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Outstanding data will appear once billing and payment tracking begins.
            </div>
          </CardContent>
        </Card>

        {/* Staff Overview (empty) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Staff Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Staff data will appear once team members are added in User Management.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {quickLinks.map((l) => (
              <Button key={l.label} asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1.5">
                <Link to={l.to}>
                  <l.icon className="h-5 w-5" />
                  <span className="text-xs text-center">{l.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
