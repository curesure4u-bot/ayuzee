import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, IndianRupee, Pill, FlaskConical, Receipt, Clock, Building2, Target, Stethoscope, Info } from "lucide-react";

const HmsBranchDashboard = () => {
  const [tab, setTab] = useState("dashboard");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Header with tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="dashboard" className="font-semibold">Dashboard</TabsTrigger>
            <TabsTrigger value="target" className="font-semibold text-orange-600">Target</TabsTrigger>
            <TabsTrigger value="analytics" className="font-semibold text-emerald-600">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
        <Badge variant="secondary" className="text-sm h-9 px-3 flex items-center">
          <CalendarIcon className="h-3.5 w-3.5 mr-1" /> {today}
        </Badge>
      </div>

      {/* Branch selector (empty - no branches configured yet) */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value="" disabled>
            <SelectTrigger className="w-[350px] h-9">
              <Building2 className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground">No branches configured</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No branches available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* TAB: Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          {/* Top KPI cards (empty) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "New Patients", icon: Users, color: "border-l-emerald-500" },
              { label: "Returning Patients", icon: Users, color: "border-l-blue-500" },
              { label: "Income", icon: IndianRupee, color: "border-l-orange-500" },
              { label: "Billed Amount", icon: Receipt, color: "border-l-purple-500" },
              { label: "Pending Amount", icon: Clock, color: "border-l-red-500" },
            ].map(kpi => (
              <Card key={kpi.label} className={`border-l-4 ${kpi.color}`}>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <kpi.icon className="h-3.5 w-3.5" /> {kpi.label}
                  </p>
                  <p className="text-xl font-bold mt-1 text-muted-foreground">—</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="py-10 text-center space-y-4">
              <Info className="h-12 w-12 text-blue-500 mx-auto" />
              <h2 className="text-xl font-semibold">No Branch Data Available</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                This dashboard will show your branch-level daily KPIs, top consultants, appointments, income breakdowns, and bill summaries once you set up your hospital branches and start entering operational data.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>To get started:</p>
                <p>1. Go to <strong>Hospital Profile</strong> to add your branches</p>
                <p>2. Add doctors and staff in <strong>User Management</strong></p>
                <p>3. Start registering patients and generating bills</p>
                <p>4. Data will appear here automatically</p>
              </div>
            </CardContent>
          </Card>

          {/* Chart placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" /> Top 5 Consultants
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">No consultation data yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" /> Top 5 Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">No lab test data yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Top 5 Medicines
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">No pharmacy data yet</p>
              </CardContent>
            </Card>
          </div>

          {/* Pie chart placeholders + Bill summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Appointments</CardTitle></CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">No appointments today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">IP Stats</CardTitle></CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">No IP admissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Income Type</CardTitle></CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">No income recorded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Bill Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "OP Bills", color: "text-emerald-600" },
                  { label: "IP Bills", color: "text-blue-600" },
                  { label: "Pharmacy Bills", color: "text-orange-600" },
                  { label: "Edited", color: "text-yellow-600" },
                  { label: "Cancelled", color: "text-red-600" },
                  { label: "Discounted", color: "text-purple-600" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b pb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={`text-lg font-bold ${item.color}`}>0</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: Target */}
      {tab === "target" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Target className="h-4 w-4 mr-1" /> Manage Targets
            </Button>
          </div>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="py-10 text-center space-y-4">
              <Target className="h-12 w-12 text-orange-500 mx-auto" />
              <h2 className="text-xl font-semibold">No Targets Set</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Set monthly targets for each department (Consultation, IP, Pharmacy, Treatment, etc.) to track your branch performance against goals.
              </p>
              <p className="text-sm text-muted-foreground">
                Click <strong>Manage Targets</strong> to configure your first targets.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: Analytics */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" /> {today} 00:00 - {today} 23:59
            </Badge>
          </div>

          {/* Analytics Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patients */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["New / Old", "Age Wise", "Gender Wise", "Area Wise", "Referral Wise", "Doctor Wise"].map(item => (
                  <Button key={item} variant="outline" size="sm" className="w-full justify-start bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700">
                    {item}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Collection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-teal-600 text-white text-xs px-3 py-1 rounded-full">Collection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Income", "Expense", "Profit & Loss", "Department Wise Income", "Doctor Wise Revenue", "Mode of Payment"].map(item => (
                  <Button key={item} variant="outline" size="sm" className="w-full justify-start bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700">
                    {item}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Lab */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">Lab</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Referral Wise Income", "Test Wise Income", "Credit Provider Income", "TAT Wise Tests", "Total Test Count", "Pending Reports"].map(item => (
                  <Button key={item} variant="outline" size="sm" className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700">
                    {item}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Pharmacy */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">Pharmacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Medicine Wise Sales", "Category Wise Sales", "Expiry Alert", "Low Stock Items", "Purchase vs Sales", "Top Selling Medicines"].map(item => (
                  <Button key={item} variant="outline" size="sm" className="w-full justify-start bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700">
                    {item}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Panchakarma / Therapies */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">Panchakarma</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Therapy Wise Revenue", "Therapist Productivity", "Package Utilization", "Oil Consumption", "Patient Outcomes", "Occupancy Rate"].map(item => (
                  <Button key={item} variant="outline" size="sm" className="w-full justify-start bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700">
                    {item}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Operations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="bg-slate-600 text-white text-xs px-3 py-1 rounded-full">Operations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Bed Occupancy", "Average Wait Time", "Staff Productivity", "No-show Rate", "Discharge Summary TAT", "Patient Satisfaction"].map(item => (
                  <Button key={item} variant="outline" size="sm" className="w-full justify-start bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700">
                    {item}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default HmsBranchDashboard;
